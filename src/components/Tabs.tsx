// src/components/Tabs.tsx
import React from 'react';
import styles from './Tabs.module.css';

interface TabProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export default function Tabs({ tabs, activeTab, onTabChange, children }: TabProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabsContent}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            style={{ display: activeTab === tabs[index]?.id ? 'block' : 'none' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}