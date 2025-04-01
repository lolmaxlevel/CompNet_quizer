// src/utils/parser.ts
import {Answer, Question, QuestionGroup} from './types';

export function parseGroups(content: string): QuestionGroup[] {
  const groups: QuestionGroup[] = [];

  // Extract group list
  const groupListMatch = /<GR-List>([\s\S]*?)<\/GR-List>/i.exec(content);
  const groupNames: Record<number, string> = {};

  if (groupListMatch) {
    const groupListContent = groupListMatch[1].trim();
    const groupNameLines = groupListContent.split('\n');

    groupNameLines.forEach(line => {
      const match = /Группа\s+(\d+)[.,]\s+(.*)/i.exec(line.trim());
      if (match) {
        const groupId = parseInt(match[1]);
        groupNames[groupId] = match[2].trim();
      }
    });
  }

  // Extract individual groups
  const groupRegex = /<GR-(\d+)>([\s\S]*?)<\/GR-\1>/g;
  let groupMatch;

  while ((groupMatch = groupRegex.exec(content)) !== null) {
    const groupId = parseInt(groupMatch[1]);
    const groupContent = groupMatch[2];

    // Get first line with two numbers
    const lines = groupContent.trim().split('\n');
    if (lines.length >= 1) {
      const [totalQuestions, randomQuestions] = lines.slice(0, 2).map(Number);

      // Extract question IDs from <tv_d> tag
      const questionIdsMatch = /<tv_d>([\s\S]*?)<\/tv_d>/i.exec(groupContent);
      const questionIds: number[] = [];

      if (questionIdsMatch) {
        const idsContent = questionIdsMatch[1].trim();
        questionIds.push(...idsContent.split(/\s+/).map(id => parseInt(id.trim())));
      }

      groups.push({
        id: groupId,
        name: groupNames[groupId] || `Group ${groupId}`,
        totalQuestions,
        randomQuestions,
        questionIds
      });
    }
  }

  return groups;
}

// New parser for the text format
// Fix the answer extraction in parseTxt function
export function parseTxt(txtContent: string): Question[] {
    const questions: Question[] = [];
    const questionBlockRegex = /<(\d+)>([\s\S]*?)<\/\1>/g;
    let match;

    while ((match = questionBlockRegex.exec(txtContent)) !== null) {
        const questionId = match[1];
        const questionContent = match[2];

        // Extract options section
        const optionsMatch = /<options>([\s\S]*?)<\/options>/i.exec(questionContent);
        const options: Record<string, string> = {};

        if (optionsMatch) {
            const optionsText = optionsMatch[1];
            const optionLines = optionsText.trim().split('\n');

            for (const line of optionLines) {
                const [key, value] = line.split('=').map(part => part.trim());
                if (key && value) {
                    options[key] = value;
                }
            }
        }

        // Extract question text
        const questionMatch = /<question>([\s\S]*?)<\/question>/i.exec(questionContent);
        const questionText = questionMatch ? questionMatch[1].trim() : "";

        // Extract description
        const descriptionMatch = /<description>([\s\S]*?)<\/description>/i.exec(questionContent);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";

        // Extract answers - FIX: More robust pattern that handles whitespace better
        const answers: Answer[] = [];
        const rightCount = parseInt(options.right || "0");

        for (let i = 1; i <= parseInt(options.n || "0"); i++) {
            // Updated regex to better handle whitespace and newlines
            const answerRegex = new RegExp(`<a_${i}>([\\s\\S]*?)</a_${i}>`, 'i');
            const answerMatch = answerRegex.exec(questionContent);

            if (answerMatch) {
                const answerText = answerMatch[1].trim();
                answers.push({
                    text: answerText,
                    is_correct: i <= rightCount
                });
            }
        }

        // Map type from the options to our internal type

        questions.push({
            id: Number(questionId),
            type: options.type,
            right: rightCount,
            value: options.max || "1",
            text: questionText,
            images: [], // No images in this format
            answers,
            group: "" // No group in this format
        });
    }

    return questions;
}