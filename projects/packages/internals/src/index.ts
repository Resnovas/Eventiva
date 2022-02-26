import { Oso } from 'oso';

class User {
  readonly country: string;
  constructor(country: string) {
    this.country = country;
  }
}

class Todo {
  readonly creator: {
    readonly country: string;
  };
  constructor(creator: { readonly country: string }) {
    this.creator = creator;
  }
}

async function main(user: User, action: string, resource: unknown) {
  const oso = new Oso();
  oso.registerClass(Date);
  oso.registerClass(User);
  await oso.loadFiles(['policy.polar']);
  return oso.isAllowed(user, action, resource);
}

main(
  new User('united kingdom'),
  'view',
  new Todo({ country: 'united kingdom' })
); //?
