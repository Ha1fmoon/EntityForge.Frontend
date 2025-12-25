import {createEntity, getEntity, updateEntity} from './client'

export const DEMO_CONTACT = {
    name: 'Contact',
    pluralName: 'Contacts',
    fields: [
        {
            name: 'FirstName',
            type: {id: 'string', baseType: 'string', isValueObject: false},
            isRequired: true,
            isSearchable: true,
        },
        {
            name: 'LastName',
            type: {id: 'string', baseType: 'string', isValueObject: false},
            isRequired: true,
            isSearchable: true,
        },
        {
            name: 'Email',
            type: {id: 'email', baseType: 'string', isValueObject: true},
            isRequired: true,
            isUnique: true,
            isSearchable: true,
        },
        {
            name: 'Company',
            type: {id: 'string', baseType: 'string', isValueObject: false},
            isRequired: false,
            isSearchable: true,
        },
        {
            name: 'Position',
            type: {id: 'string', baseType: 'string', isValueObject: false},
            isRequired: false,
        },
        {
            name: 'DateOfBirth',
            type: {id: 'datetime', baseType: 'DateTime', isValueObject: false},
            isRequired: false,
        },
        {
            name: 'Notes',
            type: {id: 'string', baseType: 'string', isValueObject: false},
            isRequired: false,
        },
    ],
}

export async function createTestEntity() {
    let exists
    try {
        const remote = await getEntity(DEMO_CONTACT.name)
        exists = !!remote
    } catch {
        exists = false
    }

    if (exists) {
        await updateEntity(DEMO_CONTACT.name, DEMO_CONTACT)
    } else {
        await createEntity(DEMO_CONTACT)
    }
}