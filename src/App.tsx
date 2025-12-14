import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { TabNav, Tab } from "./components/TabNav";
import { VisualizationPicker } from "./components/VisualizationPicker";
import { PatternEditor } from "./components/PatternEditor";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { AboutSection } from "./components/AboutSection";
import { renderVisualization } from "./components/visualizations";
import { useBreathingTimer } from "./hooks/useBreathingTimer";
import { useWakeLock } from "./hooks/useWakeLock";
import {
  Pattern,
  EditablePattern,
  PHASES,
  DEFAULT_PATTERNS,
  VISUALIZATIONS,
  COLORS,
} from "./types";
import { formatTime } from "./utils";
import "./styles.css";

type EditingPatternState = EditablePattern | null;

export default function BreathingShapes() {
  // Pattern state
  const [patterns, setPatterns] = useState<Pattern[]>(DEFAULT_PATTERNS);
  const [activePatternId, setActivePatternId] = useState("box4");
  const activePattern = patterns.find((p) => p.id === activePatternId) || patterns[0];

  // UI state
  const [visualization, setVisualization] = useState("box");
  const [activeTab, setActiveTab] = useState<Tab>("breathe");
  const [showVizPicker, setShowVizPicker] = useState(false);
  const [showPatternEditor, setShowPatternEditor] = useState(false);
  const [editingPattern, setEditingPattern] = useState<EditingPatternState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Pattern | null>(null);

  // Settings state
  const [haptics, setHaptics] = useState(true);
  const [voice, setVoice] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<"short" | "guided">("short");

  // Wake lock for keeping screen on
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  // Voice helper
  const speak = useCallback(
    (text: string) => {
      if (!voice || typeof speechSynthesis === "undefined") return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    },
    [voice]
  );

  // Haptic helper
  const triggerHaptic = useCallback(() => {
    if (haptics && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [haptics]);

  // Phase change handler
  const handlePhaseChange = useCallback(
    (phase: number) => {
      triggerHaptic();
      if (voice) {
        speak(PHASES[phase].voice);
      }
    },
    [triggerHaptic, voice, speak]
  );

  // Breathing timer
  const timer = useBreathingTimer({
    pattern: activePattern,
    onPhaseChange: handlePhaseChange,
  });

  const currentViz = VISUALIZATIONS.find((v) => v.id === visualization);
  const currentDuration = timer.durations[timer.currentPhase];
  const remainingSeconds = Math.ceil(currentDuration * (1 - timer.phaseProgress));

  // Session controls
  const startSession = () => {
    requestWakeLock();
    timer.start();
    if (voice) {
      speak(
        voiceStyle === "guided"
          ? "Starting breathing session. Breathe in."
          : "Breathe in"
      );
    }
  };

  const stopSession = () => {
    releaseWakeLock();
    timer.stop();
    if (voice) speak("Session complete");
  };

  // Pattern management
  const openPatternEditor = (type: "box" | "trapezoid") => {
    if (type === "box") {
      setEditingPattern({
        id: null,
        name: "",
        type: "box",
        boxDuration: 4,
        durations: [4, 4, 4, 4],
      });
    } else {
      setEditingPattern({
        id: null,
        name: "",
        type: "trapezoid",
        durations: [4, 4, 4, 4],
      });
    }
    setShowPatternEditor(true);
  };

  const savePattern = () => {
    if (!editingPattern) return;
    if (!editingPattern.name.trim()) {
      alert("Please enter a pattern name");
      return;
    }

    const newPattern: Pattern = {
      ...editingPattern,
      id: editingPattern.id || `custom-${Date.now()}`,
    };

    if (editingPattern.id) {
      setPatterns(patterns.map((p) => (p.id === editingPattern.id ? newPattern : p)));
    } else {
      setPatterns([...patterns, newPattern]);
    }

    setActivePatternId(newPattern.id);
    setShowPatternEditor(false);
    setEditingPattern(null);
  };

  const deletePattern = (id: string) => {
    if (patterns.length <= 1) {
      setDeleteConfirm(null);
      return;
    }
    const newPatterns = patterns.filter((p) => p.id !== id);
    setPatterns(newPatterns);
    if (activePatternId === id) {
      setActivePatternId(newPatterns[0].id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <Header
        isRunning={timer.isRunning}
        cycle={timer.cycle}
        totalTime={timer.totalTime}
        onSettingsClick={() => setActiveTab("settings")}
      />

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="main">
        {activeTab === "breathe" && (
          <div className="breathe-container">
            {/* Visualization Picker Button */}
            <button className="viz-picker-btn" onClick={() => setShowVizPicker(true)}>
              <span className="viz-picker-icon">{currentViz?.icon}</span>
              <span>{currentViz?.name}</span>
              <span className="viz-picker-arrow">▼</span>
            </button>

            {/* Active Pattern Display */}
            <div className="pattern-badge">
              {activePattern.name} • {activePattern.durations.join("-")}
            </div>

            {/* Visualization */}
            <div className="viz-wrapper">
              {renderVisualization(visualization, {
                phase: timer.currentPhase,
                progress: timer.phaseProgress,
                durations: timer.durations,
              })}
            </div>

            {/* Phase Info */}
            <div className="phase-info">
              <div className="phase-label" style={{ color: COLORS[timer.currentPhase] }}>
                {PHASES[timer.currentPhase].label}
              </div>
              <div className="phase-instruction">
                {timer.isRunning ? PHASES[timer.currentPhase].instruction : "Ready to begin"}
              </div>
              {timer.isRunning && currentDuration > 0 && (
                <div className="phase-timer">{remainingSeconds}</div>
              )}
            </div>

            {/* Controls */}
            <div className="controls">
              {!timer.isRunning ? (
                <button className="control-btn start-btn" onClick={startSession}>
                  Start
                </button>
              ) : (
                <>
                  <button className="control-btn pause-btn" onClick={timer.togglePause}>
                    {timer.isPaused ? "▶" : "❚❚"}
                  </button>
                  <button className="control-btn stop-btn" onClick={stopSession}>
                    Stop
                  </button>
                </>
              )}
            </div>

            {/* Quick Toggles */}
            <div className="quick-toggles">
              <div className="toggle-row">
                <span className="toggle-label">Haptics</span>
                <div
                  className={`toggle-switch ${haptics ? "on" : ""}`}
                  onClick={() => setHaptics(!haptics)}
                  role="switch"
                  aria-checked={haptics}
                  tabIndex={0}
                />
              </div>
              <div className="toggle-row">
                <span className="toggle-label">Voice</span>
                <div
                  className={`toggle-switch ${voice ? "on" : ""}`}
                  onClick={() => setVoice(!voice)}
                  role="switch"
                  aria-checked={voice}
                  tabIndex={0}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "patterns" && (
          <div className="tab-content">
            <h2 className="section-title">Breathing Patterns</h2>

            {/* Create New Pattern Buttons */}
            <div className="pattern-type-buttons">
              <button className="type-btn" onClick={() => openPatternEditor("box")}>
                <div className="type-btn-icon">◻</div>
                <div className="type-btn-title">New Box</div>
                <div className="type-btn-desc">Equal sides</div>
              </button>
              <button className="type-btn" onClick={() => openPatternEditor("trapezoid")}>
                <div className="type-btn-icon">△</div>
                <div className="type-btn-title">New Trapezoid</div>
                <div className="type-btn-desc">Custom timing</div>
              </button>
            </div>

            {/* Pattern List */}
            <div className="pattern-list">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`pattern-card ${activePatternId === pattern.id ? "active" : ""}`}
                >
                  <div
                    className="pattern-card-clickable"
                    onClick={() => {
                      setActivePatternId(pattern.id);
                      setActiveTab("breathe");
                    }}
                  >
                    <div className="pattern-card-header">
                      <span className="pattern-type-icon">
                        {pattern.type === "box" ? "◻" : "△"}
                      </span>
                      <span className="pattern-name">{pattern.name}</span>
                    </div>
                    <div className="pattern-card-desc">
                      {pattern.type === "box"
                        ? `All sides: ${pattern.boxDuration || pattern.durations[0]}s`
                        : `In ${pattern.durations[0]}s • Hold ${pattern.durations[1]}s • Out ${pattern.durations[2]}s • Hold ${pattern.durations[3]}s`}
                    </div>
                  </div>
                  <div className="pattern-card-actions">
                    {activePatternId === pattern.id && (
                      <span className="active-badge">Active</span>
                    )}
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(pattern);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-content">
            <h2 className="section-title">Settings</h2>

            <div className="settings-list">
              {/* Haptics */}
              <div className="settings-card">
                <div className="settings-card-content">
                  <div>
                    <div className="settings-label">Haptic Feedback</div>
                    <div className="settings-desc">Vibrate on phase transitions</div>
                  </div>
                  <div
                    className={`toggle-switch ${haptics ? "on" : ""}`}
                    onClick={() => setHaptics(!haptics)}
                    role="switch"
                    aria-checked={haptics}
                    tabIndex={0}
                  />
                </div>
              </div>

              {/* Voice */}
              <div className="settings-card">
                <div className="settings-card-content">
                  <div>
                    <div className="settings-label">Voice Prompts</div>
                    <div className="settings-desc">Announce phase transitions</div>
                  </div>
                  <div
                    className={`toggle-switch ${voice ? "on" : ""}`}
                    onClick={() => setVoice(!voice)}
                    role="switch"
                    aria-checked={voice}
                    tabIndex={0}
                  />
                </div>
                {voice && (
                  <div className="voice-options">
                    <button
                      className={`voice-option-btn ${voiceStyle === "short" ? "active" : ""}`}
                      onClick={() => setVoiceStyle("short")}
                    >
                      Short prompts
                    </button>
                    <button
                      className={`voice-option-btn ${voiceStyle === "guided" ? "active" : ""}`}
                      onClick={() => setVoiceStyle("guided")}
                    >
                      Guided
                    </button>
                  </div>
                )}
              </div>

              {/* Default Viz */}
              <div className="settings-card">
                <div className="settings-label settings-label--spaced">
                  Default Visualization
                </div>
                <button
                  className="viz-picker-btn viz-picker-btn--full"
                  onClick={() => setShowVizPicker(true)}
                >
                  <span className="viz-picker-icon">{currentViz?.icon}</span>
                  <span>{currentViz?.name}</span>
                </button>
              </div>
            </div>

            {/* About Section */}
            <AboutSection />
          </div>
        )}
      </main>

      {/* Modals */}
      <VisualizationPicker
        isOpen={showVizPicker}
        onClose={() => setShowVizPicker(false)}
        currentVisualization={visualization}
        onSelect={setVisualization}
      />

      <PatternEditor
        isOpen={showPatternEditor}
        onClose={() => setShowPatternEditor(false)}
        pattern={editingPattern}
        onChange={setEditingPattern}
        onSave={savePattern}
      />

      <DeleteConfirmModal
        pattern={deleteConfirm}
        canDelete={patterns.length > 1}
        onConfirm={() => deleteConfirm && deletePattern(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
