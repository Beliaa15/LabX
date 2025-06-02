import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { UnityContainer, TaskWrapper } from "./XorTask.styles";

export default function XorTask() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "/assets/TaskXor/build/TaskXor.loader.js",
    dataUrl: "/assets/TaskXor/build/webgl.data",
    frameworkUrl: "/assets/TaskXor/build/build.framework.js",
    codeUrl: "/assets/TaskXor/build/build.wasm",
  });

  return (
    <TaskWrapper>
      <UnityContainer>
        <div>
          <Unity 
            unityProvider={unityProvider}
            style={{ background: '#1a1a1a' }}
          />
        </div>
      </UnityContainer>
    </TaskWrapper>
  );
}