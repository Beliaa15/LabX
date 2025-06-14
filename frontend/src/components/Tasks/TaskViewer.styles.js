import styled from 'styled-components';

export const TaskWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  min-height: calc(100vh - 100px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const TaskHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .task-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .task-description {
    font-size: 1.1rem;
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .back-button {
    background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;

    .task-title {
      font-size: 2rem;
    }

    .task-meta {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

export const GameSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .game-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const UnityContainer = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #333;

  /* Container for the Unity canvas */
  & > div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  /* Style the Unity canvas itself */
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    border-radius: 10px;
  }

  /* Loading overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    z-index: 10;
    border-radius: 10px;

    .loading-content {
      text-align: center;
      color: white;

      h3 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        font-weight: 600;
      }

      .progress-bar {
        width: 320px;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
          border-radius: 4px;
        }
      }

      .progress-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: #667eea;
      }
    }
  }

  @media (max-width: 768px) {
    height: 400px;

    .loading-overlay .loading-content {
      .progress-bar {
        width: 250px;
      }

      h3 {
        font-size: 1.2rem;
      }
    }
  }
`;

export const SubmissionSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .submission-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .submission-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-weight: 600;
      color: #2d3748;
      font-size: 1rem;
    }

    textarea {
      padding: 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      resize: vertical;
      min-height: 120px;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
  }

  .submission-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .submit-button {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .save-draft-button {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(237, 137, 54, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

export const ResultSection = styled.div`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-top: 24px;
  box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .result-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .result-content {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    backdrop-filter: blur(10px);

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .result-key {
        font-weight: 600;
        opacity: 0.9;
      }

      .result-value {
        font-weight: 500;
      }
    }
  }
`;

export const InfoSection = styled.div`
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(66, 153, 225, 0.2);

  .info-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .info-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px 16px;
    backdrop-filter: blur(10px);

    .info-label {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .info-value {
      font-weight: 600;
      font-size: 1rem;
    }
  }
`;
