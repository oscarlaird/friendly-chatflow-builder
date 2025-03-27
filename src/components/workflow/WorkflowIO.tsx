
import { KeyValueDisplay } from "./KeyValueDisplay";

interface WorkflowIOProps {
  input?: Record<string, any>;
  output?: Record<string, any>;
}

export const WorkflowIO = ({ input, output }: WorkflowIOProps) => {
  // Only render if we have input or output
  if (!input && !output) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {input && <KeyValueDisplay data={input} title="Input" />}
      {output && <KeyValueDisplay data={output} title="Output" isInput={false} />}
    </div>
  );
};
