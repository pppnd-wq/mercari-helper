// ==UserScript==
// @name         メルカリ出品ヘルパー 自動入力
// @namespace    https://pppnd-wq.github.io/
// @version      1.0
// @description  メルカリ出品ヘルパーアプリからのデータを自動入力します
// @author       mercari-helper
// @match        https://jp.mercari.com/sell/create*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  function setReact(el, v) {
    try {
      var proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    } catch(e) { el.value = v; }
    el.dispatchEvent(new Event('focus',  { bubbles: true }));
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur',   { bubbles: true }));
  }

  function tryFill(data) {
    var filled = [];
    var nameEl  = document.querySelector('input[name="name"]');
    var descEl  = document.querySelector('textarea[name="description"]');
    var priceEl = document.querySelector('input[name="price"], input[data-testid="price-text-input"]');

    if (nameEl  && data.itemName)    { setReact(nameEl,  data.itemName);       filled.push('商品名'); }
    if (descEl  && data.description) { setReact(descEl,  data.description);    filled.push('説明文'); }
    if (priceEl && data.price)       { setReact(priceEl, String(data.price));  filled.push('価格');   }

    if (filled.length > 0) {
      // きれいなURLに戻す
      history.replaceState(null, '', location.pathname);
      // 完了通知
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ff4757;color:white;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:bold;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
      toast.textContent = '✅ 自動入力完了: ' + filled.join(' / ');
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 4000);
      return true;
    }
    return false;
  }

  function main() {
    var hash = location.hash;
    if (!hash.startsWith('#mh=')) return;

    var data;
    try {
      data = JSON.parse(decodeURIComponent(hash.slice(4)));
    } catch(e) { return; }

    // フォームが描画されるまで最大10秒待つ
    var tries = 0;
    var timer = setInterval(function() {
      if (++tries > 20) { clearInterval(timer); return; }
      if (tryFill(data)) clearInterval(timer);
    }, 500);
  }

  main();
})();
