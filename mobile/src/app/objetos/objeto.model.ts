export interface Objeto {
    id?: number;
    descricao: string;
    local: string;
    tipo: string;
    situacao: 'ACHADO' | 'PERDIDO';
    status?: 'ATIVO' | 'DEVOLVIDO';
    data_encontro: string;
    contato?: string;
    foto?: string; // Pode vir como URL (string)
    dono_username?: string;
}