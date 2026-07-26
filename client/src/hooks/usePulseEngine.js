import { useEffect, useRef, useState } from "react";
import { createRandomPath,randomDelay,} from "../utils/graph";

const MIN_SPEED = 260;
const MAX_SPEED = 620;

export default function usePulseEngine(graph) {
  const frame = useRef();
  const lastTime = useRef();
  const [pulse, setPulse] = useState(null);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (!graph) return;

    const start = () => {

  const path = createRandomPath(
  graph.graphMap,
  {
    minSteps: 10,
    maxSteps: 22,
    branchChance: 0.10,
  }
);
      const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);

      if (!path.length) return;

      let segmentIndex = 0;
      let progress = 0;

      function animate(time) {

        if (!lastTime.current)
          lastTime.current = time;

        const dt =
          (time - lastTime.current) / 1000;

        lastTime.current = time;

        const segment = path[segmentIndex];

        if (!segment) {
    lastTime.current = null;
    setTimeout(() => {
        setTrail([]);
        start();
    }, randomDelay());
    return;
}

        const from =
          graph.graphMap.get(segment.from);

        const to =
          graph.graphMap.get(segment.to);

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const distance = Math.sqrt(
          dx * dx + dy * dy
        );

        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        progress += ((speed * (0.6 + ease * 0.8)) * dt) / distance;

        if (progress >= 1) {

          progress -= 1;
          segmentIndex++;

        }

        const x =
          from.x + dx * progress;

        const y =
          from.y + dy * progress;

  setTrail(old => {
    const updated = [
        {
            x,
            y,
            opacity:1,
            size:1
        },
        ...old.map(t=>({
            ...t,
            opacity:t.opacity-0.03,
            size:t.size*0.985
        }))
    ].filter(t=>t.opacity>0);
    return updated.slice(0,40);
});
        setPulse({
          x,
          y,
          segmentIndex,
        });

        frame.current =
          requestAnimationFrame(animate);
      }

      frame.current =
        requestAnimationFrame(animate);

    };

    start();

    return () => {

      cancelAnimationFrame(frame.current);

    };

  }, [graph]);

  return {
    pulse,
    trail
};
}