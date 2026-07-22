"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export type InputFieldType = "none" | "email" | "password";
export type AuthStatusType = "idle" | "submitting" | "success" | "error";

interface CharacterContextType {
  activeInput: InputFieldType;
  setActiveInput: (input: InputFieldType) => void;
  hoveredField: InputFieldType;
  setHoveredField: (input: InputFieldType) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isTyping: boolean;
  notifyTyping: () => void;
  authStatus: AuthStatusType;
  setAuthStatus: (status: AuthStatusType) => void;
  mousePos: { x: number; y: number };
  setMousePos: (pos: { x: number; y: number }) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [activeInput, setActiveInput] = useState<InputFieldType>("none");
  const [hoveredField, setHoveredField] = useState<InputFieldType>("none");
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatusType>("idle");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const notifyTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 600);
  }, []);

  return (
    <CharacterContext.Provider
      value={{
        activeInput,
        setActiveInput,
        hoveredField,
        setHoveredField,
        showPassword,
        setShowPassword,
        isTyping,
        notifyTyping,
        authStatus,
        setAuthStatus,
        mousePos,
        setMousePos,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacterContext() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacterContext must be used within a CharacterProvider");
  }
  return context;
}
