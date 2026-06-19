import type { NotificationType } from '../store/useNotificationStore';

interface MockNotification {
  type: NotificationType;
  title: string;
  message: string;
}

const NOTIFICATION_POOL: MockNotification[] = [
  { type: 'info', title: 'Check-in concluido', message: 'Delegacao do Brasil fez check-in no portao principal' },
  { type: 'info', title: 'Camera recalibrada', message: 'Camera 12 reposicionada com sucesso' },
  { type: 'warning', title: 'Congestionamento detectado', message: 'Portao Norte A atingiu 85% da capacidade' },
  { type: 'warning', title: 'Temperatura elevada', message: 'Setor C registrou 32°C — acima do limite recomendado' },
  { type: 'critical', title: 'Sensor de seguranca', message: 'Sensor do portao Sul B disparou — verificacao imediata' },
  { type: 'success', title: 'Simulacao concluida', message: 'Teste de evacuacao finalizado sem incidentes' },
  { type: 'info', title: 'Atualizacao de sistema', message: 'Firmware das cameras atualizado para v3.2.1' },
  { type: 'warning', title: 'Estoque baixo', message: 'Concessionaria do setor D com estoque critico de agua' },
  { type: 'critical', title: 'Falha de conexao', message: 'Camera 7 sem sinal ha 30 segundos' },
  { type: 'success', title: 'Backup concluido', message: 'Dados do primeiro tempo salvos com sucesso' },
  { type: 'info', title: 'VIP detectado', message: 'Delegacao da FIFA entrou pelo portao VIP' },
  { type: 'warning', title: 'Fluxo irregular', message: 'Movimentacao anormal detectada na arquibancada Leste' },
];

export function getRandomNotification(): MockNotification {
  return NOTIFICATION_POOL[Math.floor(Math.random() * NOTIFICATION_POOL.length)];
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startNotificationSimulation(
  callback: (n: MockNotification) => void,
  intervalMs = 8000,
): void {
  stopNotificationSimulation();
  intervalId = setInterval(() => {
    callback(getRandomNotification());
  }, intervalMs);
}

export function stopNotificationSimulation(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
