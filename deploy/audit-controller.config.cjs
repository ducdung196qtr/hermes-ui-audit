module.exports = {
  apps: [
    {
      name: "hermes-audit-api",
      cwd: "/root/ui-audit/apps/controller",
      script: "server.py",
      interpreter: "/opt/browser-use-env/bin/python",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "180M",
      env: { PORT: "8788", AUDIT_WORKER_ENABLED: "true" }
    },
    {
      name: "hermes-audit-fifo",
      cwd: "/root/ui-audit/apps/controller",
      script: "supervisor.py",
      interpreter: "/opt/browser-use-env/bin/python",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "550M",
      env: { AUDIT_WORKER_ENABLED: "true" }
    }
  ]
};
