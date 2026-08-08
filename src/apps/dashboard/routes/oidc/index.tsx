import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { type FC, type FormEvent, useCallback, useEffect, useState } from 'react';

import Page from 'components/Page';
import Loading from 'components/loading/LoadingComponent';
import { useApi } from 'hooks/useApi';
import globalize from 'lib/globalize';

interface OidcProviderConfiguration {
    Enabled: boolean
    ProviderId: string
    Name: string
    Authority: string
    ClientId: string
    AllowInsecureAuthority: boolean
    Scopes: string[]
    UsernameClaim: string
    RoleClaim: string
    EmailClaim: string
    RequiredGroups: string[]
    AdminGroups: string[]
    ProvisioningMode: 'Disabled' | 'CreateUser'
    SyncAdminRole: boolean
    GetClaimsFromUserInfoEndpoint: boolean
    HasClientSecret?: boolean
    RedirectUri?: string
    /** Local-only editor key, never sent to the server. */
    EditorKey?: string
}

const DEFAULT_PROVIDER: OidcProviderConfiguration = {
    Enabled: false,
    ProviderId: '',
    Name: '',
    Authority: '',
    ClientId: '',
    AllowInsecureAuthority: false,
    Scopes: [ 'openid', 'profile', 'email', 'groups' ],
    UsernameClaim: 'preferred_username',
    RoleClaim: 'groups',
    EmailClaim: 'email',
    RequiredGroups: [],
    AdminGroups: [],
    ProvisioningMode: 'Disabled',
    SyncAdminRole: false,
    GetClaimsFromUserInfoEndpoint: true
};

const splitList = (value: FormDataEntryValue | null) => (value?.toString() ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);

let editorKeyCounter = 0;
const newEditorKey = () => `editor-${editorKeyCounter++}`;

interface ProviderCardProps {
    index: number
    provider: OidcProviderConfiguration
    onDelete: (index: number) => void
}

const OidcProviderCard: FC<ProviderCardProps> = ({ index, provider, onDelete }) => {
    const onDeleteClick = useCallback(() => {
        onDelete(index);
    }, [ onDelete, index ]);

    return (
        <Stack spacing={3}>
            <Typography variant='h2'>
                {provider.Name || provider.ProviderId || globalize.translate('ButtonAddProvider')}
            </Typography>

            {provider.RedirectUri && (
                <TextField
                    label={globalize.translate('LabelRedirectUri')}
                    value={provider.RedirectUri}
                    slotProps={{ input: { readOnly: true } }}
                />
            )}

            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            name={`${index}.Enabled`}
                            defaultChecked={provider.Enabled}
                        />
                    }
                    label={globalize.translate('LabelEnabled')}
                />
            </FormControl>

            <TextField
                required
                name={`${index}.ProviderId`}
                label={globalize.translate('LabelProviderId')}
                helperText={globalize.translate('LabelProviderIdHelp')}
                defaultValue={provider.ProviderId}
            />

            <TextField
                name={`${index}.Name`}
                label={globalize.translate('LabelName')}
                defaultValue={provider.Name}
            />

            <TextField
                required
                name={`${index}.Authority`}
                label={globalize.translate('LabelAuthority')}
                helperText={globalize.translate('LabelAuthorityHelp')}
                defaultValue={provider.Authority}
            />

            <TextField
                required
                name={`${index}.ClientId`}
                label={globalize.translate('LabelClientId')}
                defaultValue={provider.ClientId}
            />

            <TextField
                name={`${index}.ClientSecret`}
                label={globalize.translate('LabelClientSecret')}
                helperText={provider.HasClientSecret ?
                    globalize.translate('LabelClientSecretKeep') :
                    undefined}
                type='password'
                autoComplete='new-password'
            />

            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            name={`${index}.AllowInsecureAuthority`}
                            defaultChecked={provider.AllowInsecureAuthority}
                        />
                    }
                    label={globalize.translate('LabelAllowInsecureAuthority')}
                />
            </FormControl>

            <TextField
                name={`${index}.Scopes`}
                label={globalize.translate('LabelScopes')}
                helperText={globalize.translate('LabelCommaSeparatedList')}
                defaultValue={provider.Scopes?.join(', ') ?? ''}
            />

            <TextField
                name={`${index}.UsernameClaim`}
                label={globalize.translate('LabelUsernameClaim')}
                defaultValue={provider.UsernameClaim}
            />

            <TextField
                name={`${index}.RoleClaim`}
                label={globalize.translate('LabelRoleClaim')}
                defaultValue={provider.RoleClaim}
            />

            <TextField
                name={`${index}.EmailClaim`}
                label={globalize.translate('LabelEmailClaim')}
                defaultValue={provider.EmailClaim}
            />

            <TextField
                name={`${index}.RequiredGroups`}
                label={globalize.translate('LabelRequiredGroups')}
                helperText={globalize.translate('LabelRequiredGroupsHelp')}
                defaultValue={provider.RequiredGroups?.join(', ') ?? ''}
            />

            <TextField
                name={`${index}.AdminGroups`}
                label={globalize.translate('LabelAdminGroups')}
                helperText={globalize.translate('LabelAdminGroupsHelp')}
                defaultValue={provider.AdminGroups?.join(', ') ?? ''}
            />

            <TextField
                name={`${index}.ProvisioningMode`}
                label={globalize.translate('LabelProvisioningMode')}
                select
                defaultValue={provider.ProvisioningMode ?? 'Disabled'}
            >
                <MenuItem value='Disabled'>
                    {globalize.translate('OptionOidcProvisioningLinkOnly')}
                </MenuItem>
                <MenuItem value='CreateUser'>
                    {globalize.translate('OptionOidcProvisioningCreateUser')}
                </MenuItem>
            </TextField>

            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            name={`${index}.SyncAdminRole`}
                            defaultChecked={provider.SyncAdminRole}
                        />
                    }
                    label={globalize.translate('LabelSyncAdminRole')}
                />
            </FormControl>

            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            name={`${index}.GetClaimsFromUserInfoEndpoint`}
                            defaultChecked={provider.GetClaimsFromUserInfoEndpoint}
                        />
                    }
                    label={globalize.translate('LabelGetUserInfoClaims')}
                />
            </FormControl>

            <Box>
                <Button
                    variant='text'
                    color='error'
                    onClick={onDeleteClick}
                >
                    {globalize.translate('ButtonDelete')}
                </Button>
            </Box>
        </Stack>
    );
};

export const Component = () => {
    const { __legacyApiClient__ } = useApi();
    const [ providers, setProviders ] = useState<OidcProviderConfiguration[]>();
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isSaving, setIsSaving ] = useState(false);
    const [ isSaved, setIsSaved ] = useState(false);
    const [ requiresRestart, setRequiresRestart ] = useState(false);
    const [ error, setError ] = useState<string>();

    useEffect(() => {
        if (!__legacyApiClient__) return;

        __legacyApiClient__.getJSON(__legacyApiClient__.getUrl('auth/oidc/configuration'))
            .then(config => {
                setProviders((config.Providers ?? []).map((provider: OidcProviderConfiguration) => ({
                    ...provider,
                    EditorKey: provider.ProviderId || newEditorKey()
                })));
                setIsLoading(false);
            })
            .catch(err => {
                console.error('[OIDC] failed to load configuration', err);
                setError('MessageOidcConfigurationLoadError');
                setIsLoading(false);
            });
    }, [ __legacyApiClient__ ]);

    const onAddProvider = useCallback(() => {
        setProviders(current => [
            ...(current ?? []),
            { ...DEFAULT_PROVIDER, EditorKey: newEditorKey() }
        ]);
        setIsSaved(false);
    }, []);

    const onDeleteProvider = useCallback((index: number) => {
        setProviders(current => (current ?? []).filter((_, i) => i !== index));
        setIsSaved(false);
    }, []);

    const onSave = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!__legacyApiClient__) return;

        const data = new FormData(e.currentTarget);
        const updatedProviders = (providers ?? []).map((provider, index) => ({
            Enabled: data.get(`${index}.Enabled`) === 'on',
            ProviderId: data.get(`${index}.ProviderId`)?.toString() ?? '',
            Name: data.get(`${index}.Name`)?.toString() ?? '',
            Authority: data.get(`${index}.Authority`)?.toString() ?? '',
            ClientId: data.get(`${index}.ClientId`)?.toString() ?? '',
            ClientSecret: data.get(`${index}.ClientSecret`)?.toString() || undefined,
            AllowInsecureAuthority: data.get(`${index}.AllowInsecureAuthority`) === 'on',
            Scopes: splitList(data.get(`${index}.Scopes`)),
            UsernameClaim: data.get(`${index}.UsernameClaim`)?.toString() ?? '',
            RoleClaim: data.get(`${index}.RoleClaim`)?.toString() ?? '',
            EmailClaim: data.get(`${index}.EmailClaim`)?.toString() ?? '',
            RequiredGroups: splitList(data.get(`${index}.RequiredGroups`)),
            AdminGroups: splitList(data.get(`${index}.AdminGroups`)),
            ProvisioningMode: data.get(`${index}.ProvisioningMode`)?.toString() === 'CreateUser' ?
                'CreateUser' :
                'Disabled',
            SyncAdminRole: data.get(`${index}.SyncAdminRole`) === 'on',
            GetClaimsFromUserInfoEndpoint: data.get(`${index}.GetClaimsFromUserInfoEndpoint`) === 'on'
        }));

        setIsSaving(true);
        setIsSaved(false);
        setRequiresRestart(false);
        setError(undefined);

        __legacyApiClient__.ajax({
            type: 'POST',
            url: __legacyApiClient__.getUrl('auth/oidc/configuration'),
            data: JSON.stringify({ Providers: updatedProviders }),
            contentType: 'application/json',
            dataType: 'json'
        }).then(result => {
            setIsSaving(false);
            setIsSaved(true);
            setRequiresRestart(!!result?.RequiresRestart);
        }).catch(async err => {
            setIsSaving(false);
            console.error('[OIDC] failed to save configuration', err);

            let message = 'MessageOidcConfigurationSaveError';
            try {
                const text = await err?.text();
                if (text) message = text;
            } catch {
                // ignore and use the generic message
            }

            setError(message);
        });
    }, [ __legacyApiClient__, providers ]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Page
            id='oidcConfigurationPage'
            title={globalize.translate('HeaderOpenIdConnect')}
            className='type-interior mainAnimatedPage'
        >
            <Box className='content-primary'>
                <form onSubmit={onSave}>
                    <Stack spacing={6}>
                        {isSaved && !requiresRestart && (
                            <Alert severity='success'>
                                {globalize.translate('SettingsSaved')}
                            </Alert>
                        )}
                        {isSaved && requiresRestart && (
                            <Alert severity='warning'>
                                {globalize.translate('MessageOidcRestartRequired')}
                            </Alert>
                        )}
                        {error && (
                            <Alert severity='error'>
                                {globalize.translate(error)}
                            </Alert>
                        )}

                        <Typography variant='h1'>{globalize.translate('HeaderOpenIdConnect')}</Typography>

                        {(providers ?? []).map((provider, index) => (
                            <OidcProviderCard
                                key={provider.EditorKey}
                                index={index}
                                provider={provider}
                                onDelete={onDeleteProvider}
                            />
                        ))}

                        <Stack direction='row' spacing={2}>
                            <Button
                                variant='outlined'
                                onClick={onAddProvider}
                            >
                                {globalize.translate('ButtonAddProvider')}
                            </Button>

                            <Button
                                type='submit'
                                size='large'
                                disabled={isSaving}
                            >
                                {globalize.translate('Save')}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Box>
        </Page>
    );
};

Component.displayName = 'OidcConfigurationPage';
