import { ClientErrorNotFound } from '../../error/httpException';

export default (): void => {
  throw new ClientErrorNotFound();
};
