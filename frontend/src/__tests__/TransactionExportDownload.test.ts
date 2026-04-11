import { triggerDownload } from '../services/transaction/TransactionExportService';

describe('triggerDownload', () => {
  let clickSpy: jest.Mock;
  let anchor: any;
  let appendSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;

  beforeEach(() => {
    clickSpy = jest.fn();
    anchor = { href: '', download: '', style: { display: '' }, click: clickSpy };
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => anchor);
    removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => anchor);
    (global as any).URL.createObjectURL = jest.fn(() => 'blob:test');
    (global as any).URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => jest.restoreAllMocks());

  it('sets anchor.download to provided filename', () => {
    triggerDownload('data', 'my-file.csv', 'text/csv');
    expect(anchor.download).toBe('my-file.csv');
  });

  it('calls anchor.click once', () => {
    triggerDownload('data', 'test.json', 'application/json');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('appends and removes anchor from body', () => {
    triggerDownload('data', 'test.csv', 'text/csv');
    expect(appendSpy).toHaveBeenCalledWith(anchor);
    expect(removeSpy).toHaveBeenCalledWith(anchor);
  });

  it('revokes the object URL after click', () => {
    triggerDownload('data', 'test.csv', 'text/csv');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('creates Blob with correct mime type', () => {
    const BlobSpy = jest.spyOn(global, 'Blob');
    triggerDownload('hello', 'test.csv', 'text/csv;charset=utf-8;');
    expect(BlobSpy).toHaveBeenCalledWith(['hello'], { type: 'text/csv;charset=utf-8;' });
    BlobSpy.mockRestore();
  });
});
