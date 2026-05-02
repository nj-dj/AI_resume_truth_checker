import { spawn } from "node:child_process";

const createCommand = (args) => {
  if (process.platform !== "win32") {
    return {
      command: "npm",
      args,
    };
  }

  return {
    command: process.env.ComSpec || "cmd.exe",
    args: ["/d", "/s", "/c", ["npm", ...args].join(" ")],
  };
};

const commands = [
  {
    name: "backend",
    args: ["run", "dev", "--prefix", "backend"],
  },
  {
    name: "frontend",
    args: ["run", "dev", "--prefix", "frontend"],
  },
];

const children = commands.map(({ name, args }) => {
  const command = createCommand(args);
  const child = spawn(command.command, command.args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      return;
    }

    if (code !== 0) {
      console.error(`${name} dev server exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

const shutdown = (code = 0) => {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
