import { useEffect, useState } from 'react';
import EmeraldFacet from './EmeraldFacet.jsx';

const STAGES = ['Embedding query', 'Searching the archive', 'Confirming with Omochao'];

export default function PipelineStatus() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 pl-9">
      <EmeraldFacet size={20} active />
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-emerald">{STAGES[stageIndex]}…</span>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-panelLine">
          <div className="h-full w-1/3 animate-scan bg-gradient-to-b from-emerald via-emerald-glow to-emerald bg-[length:100%_300%]" />
        </div>
      </div>
    </div>
  );
}
