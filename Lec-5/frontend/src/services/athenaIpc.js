export function startTimerOnMain() {
  if (window.athena?.startTimerOnMain) {
    return window.athena.startTimerOnMain();
  }
  return Promise.resolve();
}

export function registerTimerTickListener(callback) {
  if (window.athena?.registerListenerForTimerTickFromMain) {
    return window.athena.registerListenerForTimerTickFromMain(callback);
  }
  return null;
}

export function registerCameraSnapListener(callback) {
  if (window.athena?.registerListenerForCameraSnapFromMain) {
    return window.athena.registerListenerForCameraSnapFromMain(callback);
  }
  return null;
}

export function storeCameraSnapImageOnDisk(arrayBuffer) {
  if (window.athena?.storeCameraSnapImageOnDisk) {
    window.athena.storeCameraSnapImageOnDisk(arrayBuffer);
  }
}

export function showNativeRules() {
  if (window.athena?.showRules) {
    window.athena.showRules();
  } else {
    alert(
      "Athena Exam Rules:\n" +
      "1. Stay on the exam screen.\n" +
      "2. Camera must remain enabled.\n" +
      "3. Do not leave the exam.\n" +
      "4. Do not use external assistance.\n" +
      "5. Click Exit Exam when finished."
    );
  }
}

export function isAthenaDesktopEnvironment() {
  return Boolean(window.athena);
}
