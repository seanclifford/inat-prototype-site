# Prototypes for iNaturalist

I created this site to come up with some tools to make things easier for the iNaturalist site.
It was also created so I could try out the iNaturalist API, and get familiar with additions to HTML and Javascript from the last decade or so.

Styling is kept super simple to avoid time spent making things look pretty. Code may be a bit quick and dirty in places too.

## Developer setup
- `npm install`
- `npm run build` or `npm run watch`
- `npx http-server` to run the http server.

## Tools

### Bulk send message
iNaturalist has a messaging system, but it only allows a single message to be sent to a single recipient at a time. 
This makes some use cases like group messaging, or notifying a large set of users of something very onerous.

This tool was created to make messaging a lot of iNaturalist users about the same thing easier, with the end goal of bringing users of iNaturalist closer together.
It supports the following use cases for selecting users:

1. Creating a manually defined list of users
2. Loading users from an observation export. Either from a JSON export (from the API), or from a CSV export when you download/export a list of observations in the site. An example where this might be used is if a researcher used a set of observations exported from iNaturalist in their research - they may want to thank all the owners of those observations for making them while informing them that it helped them to science.
3. Loading users from just the observation ids as a csv. The use case would be similar to the above example, but may be used if all they had handy was a list of observation ids.
4. Loading users from iNaturalist projects. This could be used to inform users of a project that they may be interested in another project that's recently been created.

### Auto combine observations
A common mistake that new users of iNaturalist often make is they'll create a separate observation per photo they've taken - even when they have multiple photos of the same thing from different angles.
Each observation of an organism at a point in time should be a single observation, so these new users are often asked to combine the sets of photos into a single observation.
Merging observations requires a few steps to get right - and I think is sometimes beyond some new users capabilities, so I'm planning on creating something to do it for them.

The idea would be that an experienced users notices this issue, heads over here, enters all observations to merge which generates another url - they then notify the new user of this with a link to merge observations.
The user clicks the link, checks what will be merged, authenticates and confirms it. The merge will be automated for them.

I still need to confirm this will be possible via the API.

### Auto split observations
Another common mistake that new users of iNaturalist often make is they'll a single observation with heaps of photos of different things. These need to be split up into one per organism.
Splitting observations is also a little fiddly - so automating this would make it more likely to for a new user to fix these issues.

This idea is similar to the combine one in that it an experienced user will generate a url on this site for the owner of the observation to review, with the split being similarly automated.

I also still need to confirm this will be possible via the API.

## Limitations
iNaturalist has requested applications apply a rate limit of 1 request per second when making requests of the API, so the entire site is limited by this. This can make some actions take a while.

## Privacy
The entire site is client side only once a page is downloaded - no data is sent anywhere but iNaturalist via it's API, with some cached locally.