allow(user: User, "view", todo) if
    user.country = todo.creator.country;

allow(action: Action, "create", data) if
    action.country = data.creator.country;