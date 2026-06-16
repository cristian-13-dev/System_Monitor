import {getTone} from "../../utils/tone.ts";

export const Core = ({value, index}: { value: number; index: number }) => {
  return (
    <div
      title={`Core ${index + 1}: ${value}%`}
      className="h-4.5 rounded-sm"
      style={{
        backgroundColor: getTone(value),
        opacity: 0.88,
      }}
    />
  );
}