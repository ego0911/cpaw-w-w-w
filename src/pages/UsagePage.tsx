import { useEffect, useMemo, useState } from 'react';
import styles from './UsagePage.module.scss';

const KEEPER_PORT = '8081';

export function UsagePage() {
  const keeperURL = useMemo(() => {
    if (window.location.port === "8317") {
      return `http://${window.location.hostname}:${KEEPER_PORT}/?embed=cpamc`;
    }
    return `/keeper/?embed=cpamc`;
  }, []);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(keeperURL, window.location.origin).origin) return;
      const data = event.data || {};
      if (data.type === 'cpa-usage-keeper:ready') {
        setReady(true);
        setFailed(false);
      }
    };
    window.addEventListener('message', onMessage);
    const timer = window.setTimeout(() => {
      setFailed((prev) => (ready ? prev : true));
    }, 15000);
    return () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timer);
    };
  }, [keeperURL, ready]);

  return (
    <div className={styles.shell}>
      <iframe
        className={styles.frame}
        src={keeperURL}
        title="Usage Statistics"
        data-ready={ready ? 'true' : 'false'}
      />
      {!ready && (
        <div className={styles.overlay}>
          {failed ? (
            <>
              <p>无法连接使用统计服务 (Keeper)</p>
              <p className={styles.hint}>
                请确认 keeper 容器运行中,或直接访问
                <a href={`http://${window.location.hostname}:8081/`} target="_blank" rel="noreferrer">
                  {`http://${window.location.hostname}:8081/`}
                </a>
              </p>
              <button className={styles.retry} onClick={() => { setFailed(false); setReady(false); window.location.reload(); }}>
                重试
              </button>
            </>
          ) : (
            <p>正在连接使用统计服务…</p>
          )}
        </div>
      )}
    </div>
  );
}
