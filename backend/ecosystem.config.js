module.exports = [{
  script: 'dist/server.js',
  name: 'atevus-backend',
  exec_mode: 'fork',
  cron_restart: '0 10 * * 5',
  max_memory_restart: '5000M', // Configuração para reiniciar quando atingir 769 MB de memória
  node_args: '--max-old-space-size=5000', // Limite de memória do Node.js para 769 MB
  watch: false
}]