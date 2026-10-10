import {normalizeMessage} from './language.js';
import {looksPersonal} from './privacy-data.js';

const externalLink=/(?:https?:\/\/|www\.)\S+/i;
const labelledCredential=/\b(?:(?:minha|meu)\s+)?(?:senha|password|pin|token|otp|c[oó]digo de verifica[cç][aã]o|chave pix|api[- ]?key|chave de api|secret)\b\s*(?:[:=]|\bé\b)\s*\S{3,}/i;
const highRiskTopic=/\b(?:pornografia|nudes?|suicid\w*|automutil\w*|cocaina|heroina|metanfetamina|bomba caseira|explosivo caseiro|arma de fogo)\b/;
const operationalAbuse=/\b(?:como|me ensina|ensina|tutorial|passo a passo|jeito de)\b.{0,120}\b(?:roubar|furtar|invadir|hackear|clonar cartao|capturar senha|phishing|keylogger|malware|ransomware|burlar|desativar antivirus)\b/;
const realSecretRequest=/\b(?:manda|mande|mandar|envia|envie|enviar|passa|passe|passar|compartilha|compartilhe|compartilhar|digita|digite|digitar|fornece|forneca|fornecer|informa|informe|informar|diga|dizer)\b.{0,70}\b(?:senha|password|pin|otp|token|cpf|rg|chave pix|codigo de verificacao|cartao real|numero do cartao|endereco|telefone)\b/;
const fictionalMarkers=/\b(?:batatapay|qh-demo|fictici\w*|de jogo|paoos|clube colher|cosmic changer)\b/;
const promptInjection=/\b(?:ignore|ignora|desconsidere|esqueca)\b.{0,70}\b(?:instrucao|instrucoes|regra|regras|prompt|system|sistema)\b|\b(?:mostre|mostra|revele|revela|repita)\b.{0,70}\b(?:prompt|instrucao interna|instrucoes internas|system prompt)\b/;

export function remoteDialogueRisk(text){
 const raw=String(text||'');
 if(looksPersonal(raw))return 'personal-data';
 if(externalLink.test(raw))return 'external-link';
 if(labelledCredential.test(raw))return 'credential';
 const normalized=normalizeMessage(raw);
 if(promptInjection.test(normalized))return 'prompt-injection';
 if(highRiskTopic.test(normalized))return 'age-inappropriate';
 if(operationalAbuse.test(normalized))return 'unsafe-request';
 if(realSecretRequest.test(normalized)&&!fictionalMarkers.test(normalized))return 'credential-request';
 return null;
}

export function remoteDialogueAllowed(text){return remoteDialogueRisk(text)===null;}

export function generatedDialogueSafe(text){
 if(typeof text!=='string'||!text.trim())return false;
 if(looksPersonal(text)||externalLink.test(text)||/<\/?[a-z][^>]*>/i.test(text))return false;
 const normalized=normalizeMessage(text);
 if(/\b(?:prompt interno|system prompt|instrucao interna|instrucoes internas|developer message)\b/.test(normalized))return false;
 if(highRiskTopic.test(normalized)||operationalAbuse.test(normalized))return false;
 if(realSecretRequest.test(normalized)&&!fictionalMarkers.test(normalized))return false;
 return true;
}
