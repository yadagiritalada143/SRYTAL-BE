import getNavCatalogService from '../../../services/admin/getNavCatalogService';
import NavItemModel from '../../../model/navItemModel';

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (NavItemModel as unknown as { find: jest.Mock }).find;

describe('getNavCatalogService', () => {
    beforeEach(() => {
        findMock.mockReset();
    });

    const buildChain = (items: any[]) => {
        findMock.mockReturnValue({
            sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(items) })
        });
    };

    it('returns the full catalog when no surface is given', async () => {
        const items = [{ key: 'a-instance', surface: 'admin' }];
        buildChain(items);

        const result = await getNavCatalogService.getNavCatalog();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect((findMock.mock.results[0].value as any).sort).toHaveBeenCalledWith({ surface: 1, order: 1 });
        expect(result).toEqual({ success: true, catalog: items });
    });

    it('filters the catalog by surface when one is given', async () => {
        const items = [{ key: 'dashboard', surface: 'employee' }];
        buildChain(items);

        const result = await getNavCatalogService.getNavCatalog('employee');

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({ surface: 'employee' });
        expect(result).toEqual({ success: true, catalog: items });
    });
});