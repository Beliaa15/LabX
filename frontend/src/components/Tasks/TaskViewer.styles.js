import styled from "styled-components";

export const UnityContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
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
  width: 100%;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
`; 