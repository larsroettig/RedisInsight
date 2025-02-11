import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    CliPage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();

const speed = 0.4;

fixture `Workbench Context`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await myRedisDatabasePage.deleteAllDatabases();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
test('Verify that user can see saved CLI state when navigates away to any other page', async t => {
    //Expand CLI and navigte to Browser
    await t.click(cliPage.cliExpandButton);
    await t.click(myRedisDatabasePage.browserButton);
    //Return back to Workbench and check CLI
    await t.click(myRedisDatabasePage.workbenchButton);
    await t.expect(await cliPage.cliCollapseButton.exists).ok('CLI is still expanded');
});
test('Verify that user can see saved CLI size when navigates away to any other page', async t => {
    const offsetY = 200;

    await t.click(cliPage.cliExpandButton);
    const cliAreaHeight = await cliPage.cliArea.clientHeight;
    const cliResizeButton = await cliPage.cliResizeButton;
    //Resize CLI 200px up and navigate to the My Redis databases page
    await t.drag(cliResizeButton, 0, -offsetY, { speed });
    await t.click(myRedisDatabasePage.myRedisDBButton);
    //Navigate back to the database Workbench and check CLI size
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await cliPage.cliArea.clientHeight).eql(cliAreaHeight + offsetY, 'Saved context for resizable cli is proper');
});
test('Verify that user can see all the information removed when reloads the page', async t => {
    const command = 'FT._LIST';
    //Create context modificaions and navigate to Browser
    await t.typeText(workbenchPage.queryInput, command, { replace: true, speed: speed});
    await t.click(cliPage.cliExpandButton);
    await t.click(myRedisDatabasePage.browserButton);
    //Open Workbench page and verify context
    await t.click(myRedisDatabasePage.workbenchButton);
    await t.expect(await cliPage.cliCollapseButton.exists).ok('CLI is still expanded');
    await t.expect(await workbenchPage.queryInputScriptArea.textContent).eql(command, 'Input in Editor is saved');
    //Reload the window and chek context
    await t.eval(() => location.reload());
    await t.expect(await cliPage.cliCollapseButton.exists).notOk('CLI is collapsed');
    await t.expect(await workbenchPage.queryInputScriptArea.textContent).eql('', 'Input in Editor is removed');
});
