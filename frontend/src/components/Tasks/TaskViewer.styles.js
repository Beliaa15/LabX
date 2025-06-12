import styled from "styled-components";

export const UnityContainer = styled.div`
  width: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: #1a1a1a;

  /* Container for the Unity canvas */
  & > div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  /* Style the Unity canvas itself */
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }

  /* Loading overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10;
  }
`;

export const TaskWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 100px);
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`; 