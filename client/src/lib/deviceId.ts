export function getDeviceId(): string {
  const storageKey = 'joseph-ai-device-id';
  
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
}
