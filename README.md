# node-sequence

A nodejs sequence generator which generate unique sequential number as user-assigned id for your record/document.

There are four reasons to generate id/key for your record/document by application itself.
- Independent: Data model and persistence layer are independent of Oracle sequence, mysql increment, and Mongodb ObjectId
- Fast: it is faster than Oracle sequence, mysql auto increment, UUID, and Hibernate hex table.
- Unique: UUID and Hibernate cannot guarantee unique ids in cluster env.
- Proactive: You know your new record id before you create it, so you can use it in frontend layer proactively.

you can use it as an id generating service deploying in application code.
This sequence generator inspire from the design pattern of sequence in peaa (Patterns of Enterprise Application Architecture) by Martin Fowler, the famous OOP master.
