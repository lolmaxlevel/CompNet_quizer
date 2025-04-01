// src/fdb-to-txt.ts
import * as fs from 'fs';
import { extractTagContent, extractTagFromHtml } from '@/utils/tag-extractor';
import { decodeHexString, isHexEncoded } from '@/encoders/hex-decoder';
import { decodeText, normalizeLineEndings } from '@/encoders/text-decoder';
import {
	extractNumberedBlocks,
	isPurelyNumeric,
} from '@/utils/block-processor';

/**
 * Simple options for conversion
 */
interface FdbToTxtOptions {
	debug?: boolean;
	encoding?: string;
}

/**
 * Converts an .fdb file to a plain text file
 */
export function convertFdbToTxt(
	inputFile: string,
	options: FdbToTxtOptions = {},
): string {
	const { debug = false, encoding = 'win1251' } = options;

	try {
		// Read as binary to preserve all bytes without interpretation
		const rawContent = inputFile

		// Initialize output content
		let outputContent = '';

		// Array of tags that might just contain numbers and shouldn't be decoded
		const numericTags = ['T_id', 'tv_p', 'tv_d'];

		// Process standard tags
		const tags = [
			'T_head',
			'T_id',
			'T_title',
			'tv_i',
			'tv_p',
			'tv_d',
			'info-id',
			'intro-id',
		];

		for (const tag of tags) {
			let rawTagContent = extractTagContent(rawContent, tag);

			if (rawTagContent !== null) {
				let processedContent;

				// If this is a numeric-only tag, don't try to decode it
				if (numericTags.includes(tag) && isPurelyNumeric(rawTagContent)) {
					if (debug) console.log(`Preserving numeric content for <${tag}>`);
					processedContent = rawTagContent;
				}
				// If content is hex-encoded, decode it
				else if (isHexEncoded(rawTagContent)) {
					if (debug) console.log(`Decoding hex content for <${tag}>`);
					processedContent = decodeHexString(rawTagContent, encoding);
				}
				// Otherwise, treat as text that needs encoding correction
				else {
					if (debug) console.log(`Decoding text content for <${tag}>`);
					processedContent = decodeText(rawTagContent, 'latin1', encoding);
				}

				outputContent += `<${tag}>\n${processedContent}\n</${tag}>\n\n`;
			}
		}

		// Process T_body separately
		const bodyContent = extractTagContent(rawContent, 'T_body');

		if (bodyContent !== null) {
			outputContent += '<T_body>\n';

			const blocks = extractNumberedBlocks(bodyContent);

			for (const [id, blockContent] of blocks.entries()) {
				let decodedBlock;

				if (isHexEncoded(blockContent)) {
					if (debug) console.log(`Decoding hex content for question ${id}`);
					decodedBlock = decodeHexString(blockContent, encoding);

					// Normalize line endings to remove ^M characters
					const normalizedContent = normalizeLineEndings(decodedBlock);

					outputContent += `<${id}>\n${normalizedContent}\n</${id}>\n\n`;
				} else {
					// Non-hex content (unlikely but handle it)
					outputContent += `<${id}>\n${blockContent}\n</${id}>\n\n`;
				}
			}

			outputContent += '</T_body>\n\n';
		}

		// Process gr-id separately
		const grIdContent = extractTagContent(rawContent, 'gr-id');

		if (grIdContent !== null) {
			let processedGrId;

			if (isHexEncoded(grIdContent)) {
				if (debug) console.log(`Decoding hex content for <gr-id>`);
				processedGrId = decodeHexString(grIdContent, encoding);
			} else {
				processedGrId = grIdContent;
			}

			processedGrId = normalizeLineEndings(processedGrId);

			outputContent += `<gr-id>\n${processedGrId}\n</gr-id>\n\n`;
		}

		return outputContent
	} catch (error) {
		console.error('Error converting file:', error);
		throw error;
	}
}
