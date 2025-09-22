import { Environment, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { useAtom } from "jotai";
import { Book } from "./Book";
import { bookOpenAtom, contentHoverAtom } from "./UI";

export const Experience = () => {
  const [bookOpen] = useAtom(bookOpenAtom);
  const controlsRef = useRef();
  const bookGroupRef = useRef();
  const { camera } = useThree();
  const [contentHover] = useAtom(contentHoverAtom);

  useFrame((_, delta) => {
    const isMobile = window.innerWidth <= 768;

    if (controlsRef.current) {
      // Tính offset X theo phần trăm panel phải (30%) để sách nằm giữa 70% bên trái
      const targetNow = controlsRef.current.target;
      const distance = camera.position.distanceTo(targetNow);
      const fovRad = (camera.fov * Math.PI) / 180;
      const worldWidthAtTarget = 2 * Math.tan(fovRad / 2) * distance * camera.aspect;
      const panelFrac = 0.30; // panel phải 30%
      const bias = isMobile ? 0.02 : -0.03; // đẩy lệch trái thêm một chút để tránh chạm panel
      const leftCenterOffsetX = -(panelFrac / 2 + bias) * worldWidthAtTarget;

      const desiredBookX = bookOpen ? leftCenterOffsetX : 0;
      if (bookGroupRef.current) {
        bookGroupRef.current.position.x += (desiredBookX - bookGroupRef.current.position.x) * Math.min(1, delta * 3);
      }

      const bookX = bookGroupRef.current ? bookGroupRef.current.position.x : desiredBookX;
      const target = new Vector3(bookX, 0, 0);
      controlsRef.current.target.lerp(target, Math.min(1, delta * 3));
      controlsRef.current.update();
    }

    // vị trí X đã được tính theo fov/aspect ở trên
  });

  return (
    <>
      <group ref={bookGroupRef}>
        <Book />
      </group>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        enableZoom={!contentHover}
        zoomSpeed={0.9}
        minDistance={1.6}
        maxDistance={6}
        enablePan={!contentHover && false}
        // Khi mở nội dung, để desktop scroll không bị chiếm, giảm influence của zoom
        mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
      />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
