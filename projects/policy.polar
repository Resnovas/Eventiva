allow(actor, action, resource) if
    has_permission(actor, action, resource);

actor Account {}
resource Application {}
resource Domain {}
resource Email {}
resource Feature {}
resource Files {}
resource Phone {}
resource RTW {}
resource Room {}
resource Status {}
resource Subscription {}
resource Transaction {}
resource Address {
    permissions = ["view", "open", "edit", "delete"];
    roles = ["guest", "tenent", "manager", "owner"];
    "view" if "guest";
    "open" if "tenent";
    "edit" if "manager";
    "delete" if "owner";
    "manager" if "owner";
    "tenent" if "manager";
    "guest" if "tenent";
}
has_role(user: Account, name: String, resource: Resource) if
  role in user.roles and
  role.name = name and
  role.resource = resource;