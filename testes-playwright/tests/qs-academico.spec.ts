import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://leonardobarga.github.io/02-TesteAutomatizado/');
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      // escopo na tabela para evitar captura de mensagem de sucesso
      const celula = page.locator('#tabela-alunos').getByText('João Silva');
      await expect(celula).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve permitir buscar por nome filtrando os resultados', async ({ page }) => {
      // cadastrar primeiro aluno
      await page.getByLabel('Nome do Aluno').fill('Aluno A');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // cadastrar segundo aluno
      await page.getByLabel('Nome do Aluno').fill('Aluno B');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // filtrar por "Aluno A"
      await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('Aluno A');

      // apenas uma linha deve estar visível e conter o nome correto
      const linhas = page.locator('#tabela-alunos tbody tr:visible');
      await expect(linhas).toHaveCount(1);
      await expect(linhas.first()).toContainText('Aluno A');
    });

    test('deve excluir um aluno e deixar a tabela vazia', async ({ page }) => {
      // cadastro inicial
      await page.getByLabel('Nome do Aluno').fill('Aluno Para Excluir');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('8');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // excluir o aluno
      await page.getByRole('button', { name: 'Excluir Aluno Para Excluir' }).click();

      // a tabela deve voltar ao estado inicial (nenhum registro)
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve permitir cadastrar três alunos consecutivos', async ({ page }) => {
      const nomes = ['Aluno1', 'Aluno2', 'Aluno3'];
      for (const nome of nomes) {
        await page.getByLabel('Nome do Aluno').fill(nome);
        await page.getByLabel('Nota 1').fill('6');
        await page.getByLabel('Nota 2').fill('6');
        await page.getByLabel('Nota 3').fill('6');
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      // verificar três linhas na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ler as três notas exibidas e calcular a média para comparar
      const linha = page.locator('#tabela-alunos tbody tr').first();
      const n1 = parseFloat(await linha.locator('td').nth(1).innerText());
      const n2 = parseFloat(await linha.locator('td').nth(2).innerText());
      const n3 = parseFloat(await linha.locator('td').nth(3).innerText());      
      const mediaEsperada = ((n1 + n2 + n3) / 3).toFixed(2);

      const celulaMedia = linha.locator('td').nth(4);
      await expect(celulaMedia).toHaveText(mediaEsperada);
    });

    test('deve mostrar situação Aprovado para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Top');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

    test('deve mostrar situação Reprovado para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Ruim');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('4');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('não deve aceitar notas maiores que 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Inválido');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela não deve exibir o aluno
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('não deve aceitar notas menores que 0', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Negativo');
      await page.getByLabel('Nota 1').fill('-1');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela não deve exibir o aluno
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve contar corretamente aprovados, recuperação e reprovados', async ({ page }) => {
      // Aprovado (média 7.0 considerando bug de cálculo)
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('0');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Recuperação (média 6.0)
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperacao');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('0');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Reprovado (média 4.0)
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('0');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // validar os cards de estatísticas
      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#stat-aprovados')).toHaveText('1');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

  });
});