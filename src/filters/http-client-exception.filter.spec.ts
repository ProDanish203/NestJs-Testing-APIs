import { HttpClientExceptionFilter } from '../http-client-exception.filter';

describe('HttpClientExceptionFilter', () => {
  it('should be defined', () => {
    expect(new HttpClientExceptionFilter()).toBeDefined();
  });
});
