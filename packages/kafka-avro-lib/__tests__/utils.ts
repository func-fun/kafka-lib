import { HeaderNames, MessageHeaders } from '../types';
import { getMessageHeaderValue } from '../utils';

describe('getHeaderValue', () => {
  const emptyHeaders: MessageHeaders = {};
  const exampleHeaders: MessageHeaders = {
    Action: Buffer.from('create'),
    foo: Buffer.from('bar'),
  };

  it('header is missing', () => {
    expect(getMessageHeaderValue(emptyHeaders, 'bla')).toBe(null);
  });

  it('header matches enum', () => {
    expect(getMessageHeaderValue(exampleHeaders, HeaderNames.Action)).toBe('create');
  });

  it('header matches string', () => {
    expect(getMessageHeaderValue(exampleHeaders, 'foo')).toBe('bar');
  });
});
