import { useEffect, useMemo, useState } from 'react';
import styles from './UsagePage.module.scss';

// keeper 统一走 https 域名:Secure+Partitioned 会话 cookie 才能留存(8317 的 http iframe 存不住),
// 且与域名入口共用同一份登录态。跨源分层由 keeper 的 CSP frame-ancestors('self'+8317)放行。
// 免密/固定中文/顶栏隐藏均由服务端 keeper-shim(见 /root/cliproxyapi/keeper-shim-update.sh)注入,面板不做二次逻辑。
const KEEPER_ORIGIN = 'https://xn--cpa-v67he.0931116.xyz';

export function UsagePage() {
  const keeperURL = useMemo(() => {
    if (window.location.port === '8317') {
      return `${KEEPER_ORIGIN}/keeper/?embed=cpamc`;
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
                <a href={keeperURL} target="_blank" rel="noreferrer">
                  {keeperURL}
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
