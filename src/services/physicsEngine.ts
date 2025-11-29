import { PhysicalObject, EnvParams, SimulationState } from '../types';

const DT = 1 / 60; 

export const INITIAL_STATE: SimulationState = {
  t: 0,
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  acceleration: { x: 0, y: 0 },
  displacement: 0
};

export const calculateNextState = (
  current: SimulationState,
  obj: PhysicalObject,
  env: EnvParams,
  initialVelocity: { x: number; y: number }
): SimulationState => {
  const theta = (env.rampAngle * Math.PI) / 180;
  const Fg_x = obj.mass * env.gravity * Math.sin(theta);
  const Fn = obj.mass * env.gravity * Math.cos(theta);

  const isMoving = Math.abs(current.velocity.x) > 0.001;
  const frictionDir = current.velocity.x > 0 ? -1 : 1;
  const F_friction = isMoving ? obj.frictionCoefficient * Fn * frictionDir : 0;

  const v_rel = current.velocity.x - env.windSpeed;
  const dragDir = v_rel > 0 ? -1 : 1;
  const F_drag = 0.5 * env.airDensity * obj.dragCoefficient * obj.area * (v_rel * v_rel) * dragDir;

  const F_net_x = Fg_x + F_friction + F_drag;
  const a_x = F_net_x / obj.mass;
  let newVx = current.velocity.x + a_x * DT;
  
  if (Math.abs(current.velocity.x) < 0.05 && Math.abs(a_x) < (obj.frictionCoefficient * Fn / obj.mass) * 2 && env.rampAngle === 0) {
     newVx = 0;
  }

  const newX = current.position.x + newVx * DT;
  const newT = current.t + DT;
  const newDisp = Math.sqrt(Math.pow(newX, 2)); 

  return {
    t: newT,
    position: { x: newX, y: current.position.y },
    velocity: { x: newVx, y: 0 },
    acceleration: { x: a_x, y: 0 },
    displacement: newDisp
  };
};