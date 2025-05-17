"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const isDev = Boolean(process.env.NEXT_PUBLIC_DEVELOPMENT);

const styles = {
  bubble: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    zIndex: 9999,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#23232b",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.18)",
    cursor: "pointer",
    fontSize: 32,
    border: "2px solid #e5e5ea",
    transition: "background 0.2s",
  },
  popup: {
    position: "fixed" as const,
    bottom: 90,
    right: 24,
    zIndex: 10000,
    width: 360,
    maxWidth: "90vw",
    maxHeight: "60vh",
    background: "#18181c",
    color: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.22)",
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    resize: "both" as const,
  },
  header: {
    background: "#23232b",
    padding: "0.7rem 1.2rem",
    cursor: "move",
    fontWeight: 600,
    fontSize: 18,
    borderBottom: "1px solid #35353f",
    userSelect: "none" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    cursor: "pointer",
    fontSize: 22,
    color: "#e5e5ea",
    marginLeft: 8,
  },
  logs: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto" as const,
    fontFamily: "monospace",
    fontSize: 13,
    background: "#23232b",
  },
};

function DevBubble() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 360,
    height: 340,
  });
  const [resizing, setResizing] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
    offsetX: number;
    offsetY: number;
  }>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Patch console methods
  useEffect(() => {
    if (!isDev) return;
    const origLog = console.log;
    const origError = console.error;
    const origInfo = console.info;
    function pushLog(type: string, ...args: any[]) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [${type}] ${args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
          .join(" ")}`,
      ]);
    }
    console.log = (...args) => {
      pushLog("log", ...args);
      origLog(...args);
    };
    console.error = (...args) => {
      pushLog("error", ...args);
      origError(...args);
    };
    console.info = (...args) => {
      pushLog("info", ...args);
      origInfo(...args);
    };
    return () => {
      console.log = origLog;
      console.error = origError;
      console.info = origInfo;
    };
  }, []);

  // Scroll to bottom on new log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Drag logic
  function onMouseDown(e: React.MouseEvent) {
    setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    document.body.style.userSelect = "none";
  }
  function onMouseMove(e: MouseEvent) {
    if (!drag) return;
    setPos({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  }
  function onMouseUp() {
    setDrag(null);
    document.body.style.userSelect = "";
  }
  useEffect(() => {
    if (!drag) return;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  // Custom resize logic
  function onResizeMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (!popupRef.current) return;
    const rect = popupRef.current.getBoundingClientRect();
    setResizing({
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    document.body.style.userSelect = "none";
  }
  function onResizeMouseMove(e: MouseEvent) {
    if (!resizing) return;
    // Calculate new size based on where the mouse is now vs where it started
    const deltaX = e.clientX - resizing.x;
    const deltaY = e.clientY - resizing.y;
    const newWidth = Math.max(
      260,
      Math.min(window.innerWidth * 0.95, resizing.w + deltaX)
    );
    const newHeight = Math.max(
      180,
      Math.min(window.innerHeight * 0.8, resizing.h + deltaY)
    );
    setSize({ width: newWidth, height: newHeight });
  }
  function onResizeMouseUp() {
    setResizing(null);
    document.body.style.userSelect = "";
  }
  useEffect(() => {
    if (!resizing) return;
    window.addEventListener("mousemove", onResizeMouseMove);
    window.addEventListener("mouseup", onResizeMouseUp);
    return () => {
      window.removeEventListener("mousemove", onResizeMouseMove);
      window.removeEventListener("mouseup", onResizeMouseUp);
    };
  }, [resizing]);

  // --- Persistence helpers ---
  useEffect(() => {
    // Restore state from localStorage
    try {
      const saved = localStorage.getItem("devbubble-state");
      if (saved) {
        const { open, pos, size, logs, lastPath } = JSON.parse(saved);
        if (typeof open === "boolean") setOpen(open);
        if (pos && typeof pos.x === "number" && typeof pos.y === "number")
          setPos(pos);
        if (
          size &&
          typeof size.width === "number" &&
          typeof size.height === "number"
        )
          setSize(size);
        if (Array.isArray(logs)) setLogs(logs);
      }
    } catch {}
  }, []);
  useEffect(() => {
    // Save state to localStorage
    try {
      localStorage.setItem(
        "devbubble-state",
        JSON.stringify({ open, pos, size, logs, lastPath: pathname })
      );
    } catch {}
  }, [open, pos, size, logs, pathname]);

  if (!isDev) return null;
  return (
    <>
      <div
        style={styles.bubble}
        onClick={() => setOpen((o) => !o)}
        title="Ouvrir la console Dev"
      >
        🐞
      </div>
      {open && (
        <div
          ref={popupRef}
          style={{
            ...styles.popup,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            width: size.width,
            height: size.height,
            resize: undefined, // Remove native resize
          }}
        >
          <div style={styles.header} onMouseDown={onMouseDown}>
            Console Dev
            <span
              style={styles.close}
              onClick={() => setOpen(false)}
              title="Fermer"
            >
              ×
            </span>
          </div>
          <div style={styles.logs}>
            {logs.length === 0 ? (
              <div style={{ color: "#aaa" }}>Aucun log pour l'instant.</div>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
            <div ref={logsEndRef} />
          </div>
          {/* Custom resize handle */}
          <div
            onMouseDown={onResizeMouseDown}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 24,
              height: 24,
              cursor: "nwse-resize",
              zIndex: 10,
              background: "none",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              userSelect: "none",
            }}
            title="Redimensionner"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M2 16h12v-2M6 16v-4m4 4v-8"
                stroke="#e5e5ea"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}

export default DevBubble;
