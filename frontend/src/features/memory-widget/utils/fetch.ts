import type { Dispatch, SetStateAction } from "react";
import { API_URL } from "../constants.ts";
import type { MemoryData } from "../types.ts";

export const fetchMemoryData = async (
  setData: Dispatch<SetStateAction<MemoryData | null>>,
  setError: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: MemoryData = await res.json();
    setData(json);
    setError(false);
  } catch {
    setError(true);
  }
};