import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Group, Stack } from '@mantine/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert color="red" title="Đã xảy ra lỗi">
          <Stack>
            <div>Thành phần này đã gặp sự cố khi hiển thị.</div>
            <Group position="right">
              <Button size="xs" onClick={this.resetError}>Thử lại</Button>
            </Group>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
