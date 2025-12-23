import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(p){ super(p); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("[ErrorBoundary]", err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: "#d00", fontFamily: "monospace" }}>
          <h2>Something went wrong</h2>
          <pre>{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
