# INFO

Middelware is to change the broswer based useState to read profile authenticisation
and instead use ctx, cts.user.role to set up role.tenant, role.landlord, role.unauthroized, role.admin and using that ctx to make sure each profile only see what they are allowed to see