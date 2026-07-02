import { GroupData, IdeaItem } from '../types';
import { YAMCOL }    from './yamcol';
import { BARBOSA }   from './barbosa';
import { PARALELAS } from './paralelas';
import { LUPO }      from './lupo';
import { FERRACINI } from './ferracini';

export const GROUPS: GroupData[] = [
  YAMCOL,
  BARBOSA,
  PARALELAS,
  LUPO,
  FERRACINI,
];

export { YAMCOL, BARBOSA, PARALELAS, LUPO, FERRACINI };

export const IDEAS: IdeaItem[] = [
  {
    id: 'namorados',
    title: '🎁 Guia de Presentes: Dia dos Namorados',
    description: 'Um fluxo interativo onde o cliente responde 3 perguntas rápidas e recebe uma curadoria personalizada de produtos. Focado em facilitar a decisão de compra e gerar lead qualificado para o WhatsApp.',
    fluxo: 'Perfil do Parceiro → Faixa de Preço → Sugestão Direta (+Botão WhatsApp)',
    temas: ['Romance Moderno','Premium Dark','Elegante'],
    elementos: ['Quiz de Personalidade','Galeria de Destaques','CTA Direto'],
    url: 'https://dia-dos-namorados-xi-two.vercel.app/',
  },
  {
    id: 'vip',
    title: '💎 Experiência Grupo VIP',
    description: 'Landing page de alta conversão para recrutamento de novos membros para o grupo exclusivo. Design luxuoso com foco em escassez e benefícios únicos.',
    fluxo: 'Promessa de Exclusividade → Benefícios → Entrada no Grupo',
    temas: ['Luxo Minimalista','Gold & Black','Modern Business'],
    elementos: ['Lista de Benefícios','Contador de Vagas (Gatilho)','Depoimentos'],
    url: 'https://grupo-vip-zeta.vercel.app/',
  },
];
