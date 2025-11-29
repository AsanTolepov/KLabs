import { CircuitComponent, ComponentType, SimulationResult } from '../types';

export const solveCircuit = (
  components: CircuitComponent[], 
  nodes: string[], 
  connections: Record<string, string[]>, 
  capacitorVoltages: Record<string, number> = {}
): SimulationResult => {
  const MAX_ITER = 200;
  const TOLERANCE = 0.0001;
  const nodeVoltages: Record<string, number> = {};
  nodes.forEach(n => nodeVoltages[n] = 0);

  const fixedNodes: Record<string, boolean> = {};
  const batteries = components.filter(c => c.type === ComponentType.BATTERY);
  let groundNode = nodes[0];

  if (batteries.length > 0 && batteries[0].nodes.length === 2) {
      groundNode = batteries[0].nodes[1];
  }
  
  if (groundNode) {
      nodeVoltages[groundNode] = 0;
      fixedNodes[groundNode] = true;
  }

  const getPins = (comp: CircuitComponent) => ({ p1: comp.nodes[0], p2: comp.nodes[1] });

  for(let iter = 0; iter < MAX_ITER; iter++) {
    let maxChange = 0;
    nodes.forEach(nodeId => {
      if (fixedNodes[nodeId]) return;
      let numerator = 0;
      let denominator = 0;
      const connectedCompIds = connections[nodeId] || [];
      
      connectedCompIds.forEach(compId => {
        const comp = components.find(c => c.id === compId);
        if (!comp) return;
        if (comp.type === ComponentType.SWITCH && !comp.properties.isOn) return;
        if (comp.type === ComponentType.VOLTMETER) return;

        const pins = getPins(comp);
        if (pins.p1 !== nodeId && pins.p2 !== nodeId) return;
        const neighborNode = pins.p1 === nodeId ? pins.p2 : pins.p1;
        
        let R = 1e-6; 
        let V_gain = 0;
        const isNodeP1 = (nodeId === pins.p1);
        const polarity = isNodeP1 ? 1 : -1;

        if (comp.type === ComponentType.RESISTOR) R = comp.properties.resistance || 100;
        else if (comp.type === ComponentType.LAMP) {
             R = 20 + (comp.properties.voltage || 0) * 2; 
             if (R < 10) R = 10;
        } else if (comp.type === ComponentType.AMMETER) R = 0.01;
        else if (comp.type === ComponentType.WIRE || comp.type === ComponentType.SWITCH) R = 0.1;
        else if (comp.type === ComponentType.BATTERY) {
             R = 1.0; 
             V_gain = (comp.properties.voltage || 9) * polarity;
        } else if (comp.type === ComponentType.CAPACITOR) {
             R = 5.0;
             const v_cap = capacitorVoltages[comp.id] || 0;
             V_gain = v_cap * polarity;
        }

        if (neighborNode && nodeVoltages[neighborNode] !== undefined) {
             numerator += (nodeVoltages[neighborNode] + V_gain) / R;
             denominator += 1/R;
        }
      });

      if (denominator > 0) {
        const newVal = numerator / denominator;
        const dampedVal = nodeVoltages[nodeId] + (newVal - nodeVoltages[nodeId]) * 0.8;
        const diff = Math.abs(dampedVal - nodeVoltages[nodeId]);
        if (diff > maxChange) maxChange = diff;
        nodeVoltages[nodeId] = dampedVal;
      }
    });
    if (maxChange < TOLERANCE) break;
  }

  const currents: Record<string, number> = {};
  components.forEach(comp => {
      if (comp.nodes.length !== 2) return;
      const v1 = nodeVoltages[comp.nodes[0]];
      const v2 = nodeVoltages[comp.nodes[1]];
      let R = 0.1;
      let V_source = 0;

      if (comp.type === ComponentType.RESISTOR) R = comp.properties.resistance || 100;
      else if (comp.type === ComponentType.LAMP) R = 20 + (comp.properties.voltage || 0) * 2;
      else if (comp.type === ComponentType.BATTERY) { R = 1.0; V_source = comp.properties.voltage || 9; }
      else if (comp.type === ComponentType.CAPACITOR) { R = 5.0; V_source = capacitorVoltages[comp.id] || 0; }
      else if (comp.type === ComponentType.AMMETER) R = 0.01;

      if (comp.type === ComponentType.VOLTMETER) currents[comp.id] = 0;
      else currents[comp.id] = (v1 - v2 - V_source) / R;
  });

  return { nodes: nodeVoltages, currents };
};