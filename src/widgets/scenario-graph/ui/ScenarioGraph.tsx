import { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType, MiniMap } from "reactflow";
import type { Edge, Node } from "reactflow";
import type { Scenario } from "@/entities/scenario";
import "reactflow/dist/style.css";

type ScenarioGraphProps = {
  scenario: Scenario;
};

export function ScenarioGraph({ scenario }: ScenarioGraphProps) {
  const states = useMemo(
    () => Array.from(new Set([...scenario.possibleStates, scenario.state])),
    [scenario.possibleStates, scenario.state]
  );

  const nodes = useMemo<Node[]>(
    () =>
      states.map((state, index) => {
        const isCurrent = state === scenario.state;

        return {
          id: `${scenario.id}-${state}`,
          position: { x: index * 220, y: 0 },
          data: {
            label: isCurrent ? `${state} • Current` : state,
          },
          style: {
            width: 180,
            borderRadius: 16,
            border: isCurrent ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
            background: isCurrent ? "hsl(var(--accent))" : "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            fontWeight: isCurrent ? 600 : 500,
            boxShadow: isCurrent ? "0 0 0 1px hsl(var(--primary) / 0.15)" : "none",
            padding: "16px",
          },
        };
      }),
    [scenario.id, scenario.state, states]
  );

  const edges = useMemo<Edge[]>(() => {
    // Rich transition inference can be added in v2 from stub mappings that define requiredScenarioState/newScenarioState.
    return states.slice(0, -1).map((state, index) => ({
      id: `${scenario.id}-edge-${state}-${states[index + 1]}`,
      source: `${scenario.id}-${state}`,
      target: `${scenario.id}-${states[index + 1]}`,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    }));
  }, [scenario.id, states]);

  return (
    <div className="h-80 overflow-hidden rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) =>
            node.id.endsWith(`-${scenario.state}`) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
          }
        />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
