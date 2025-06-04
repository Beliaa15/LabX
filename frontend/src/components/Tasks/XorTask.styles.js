import styled from "styled-components";

export const UnityContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* Make sure the container maintains a 16:9 aspect ratio */
  padding-top: 56.25%;

  /* Container for the Unity canvas */
  & > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* Style the Unity canvas itself */
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

export const TaskWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`; 