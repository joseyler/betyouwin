import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TipoTransaccion } from '../common/enums';
import { Transaccion } from '../entities/transaccion.entity';
import { TransaccionesService } from './transacciones.service';

describe('TransaccionesService', () => {
  let service: TransaccionesService;

  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const repository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    create: jest.fn((data: Partial<Transaccion>) => data),
    save: jest.fn((data: Partial<Transaccion>) =>
      Promise.resolve({ id: '1', ...data }),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaccionesService,
        {
          provide: getRepositoryToken(Transaccion),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TransaccionesService>(TransaccionesService);
  });

  it('calcula saldo desde transacciones', async () => {
    queryBuilder.getRawOne.mockResolvedValue({ saldo: '1500.50' });

    await expect(service.calcularSaldo('10')).resolves.toBe(1500.5);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('t');
  });

  it('registra ingreso', async () => {
    const result = await service.registrarIngreso('10', 500, 'carga inicial');

    expect(result.tipo).toBe(TipoTransaccion.INGRESO);
    expect(result.montoPesos).toBe('500.00');
    expect(repository.save).toHaveBeenCalled();
  });

  it('rechaza retiro si supera saldo', async () => {
    queryBuilder.getRawOne.mockResolvedValue({ saldo: '100.00' });

    await expect(service.registrarRetiro('10', 200)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
