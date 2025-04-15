
import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { getStepIcon } from './utils/iconUtils';
import { nestSteps } from './utils/nestingUtils';
import { cn } from '@/lib/utils';

// Custom node components
import { WorkflowStepNode } from './graph/WorkflowStepNode';

interface WorkflowGraphProps {
  steps: any[];
  chatId?: string;
  browserEvents?: Record<string, any[]>;
  className?: string;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
}

// Define node types
const nodeTypes: NodeTypes = {
  stepNode: WorkflowStepNode
};

export const WorkflowGraph = ({
  steps,
  chatId,
  browserEvents = {},
  className,
  userInputs,
  setUserInputs
}: WorkflowGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert workflow steps to graph nodes and edges
  useEffect(() => {
    if (!steps || steps.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Create a node for each step
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    const nodeWidth = 250;
    const nodeHeight = 100;
    const horizontalSpacing = 300;
    const verticalSpacing = 150;

    // First pass: create all nodes
    steps.forEach((step, index) => {
      const stepType = step.type || 'unknown';
      const stepTitle = step.title || `Step ${index + 1}`;
      const stepDescription = step.description || '';
      
      // Calculate position based on step_number and parent-child relationships
      const xPos = (step.parent_id ? horizontalSpacing / 2 : 0) + Math.floor(index / 3) * horizontalSpacing;
      const yPos = (index % 3) * verticalSpacing;
      
      // Create node
      flowNodes.push({
        id: `step-${step.step_number || index}`,
        type: 'stepNode',
        position: { x: xPos, y: yPos },
        data: {
          ...step,
          label: stepTitle,
          description: stepDescription,
          icon: getStepIcon(stepType),
          userInputs: step.type === 'user_input' ? userInputs : undefined,
          setUserInputs: step.type === 'user_input' ? setUserInputs : undefined,
          browserEvents: step.function_name ? browserEvents[step.function_name] || [] : []
        },
        style: {
          width: nodeWidth,
          height: nodeHeight,
        }
      });
    });

    // Second pass: create edges between nodes based on step sequence
    for (let i = 0; i < steps.length - 1; i++) {
      const sourceId = `step-${steps[i].step_number || i}`;
      const targetId = `step-${steps[i + 1].step_number || (i + 1)}`;

      // Skip creating edge if parent-child relationship isn't sequential
      if (steps[i + 1].parent_id && steps[i + 1].parent_id !== steps[i].step_number) {
        continue;
      }

      flowEdges.push({
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        animated: true,
        style: { stroke: '#9E76FF', strokeWidth: 2 },
        type: 'smoothstep'
      });
    }

    // Update states
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [steps, browserEvents, userInputs, setUserInputs]);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workflow steps defined</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-background"
      >
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const type = node.data?.type || 'default';
            if (type === 'function') return '#9E76FF';
            if (type === 'user_input') return '#F59E0B';
            if (type === 'if' || type === 'for') return '#3B82F6';
            return '#64748B';
          }}
          maskColor="rgba(240, 240, 240, 0.4)"
        />
        <Background color="#aaa" gap={16} />
        
        <Panel position="top-left" className="bg-card border rounded-md p-2 shadow-sm">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600">Steps: {steps.length}</Badge>
            <Badge variant="outline">Drag to reposition</Badge>
            <Badge variant="outline">Scroll to zoom</Badge>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
