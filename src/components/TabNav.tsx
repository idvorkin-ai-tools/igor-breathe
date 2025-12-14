export type Tab = "breathe" | "patterns" | "settings";

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: Tab[] = ["breathe", "patterns", "settings"];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          onClick={() => onTabChange(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );
}
