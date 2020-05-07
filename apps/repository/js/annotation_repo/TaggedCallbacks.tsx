import React from 'react';
import {Tag, Tags} from "polar-shared/src/tags/Tags";
import {InheritedTag} from "polar-shared/src/tags/InheritedTags";
import {AutocompleteDialogProps} from "../../../../web/js/ui/dialogs/AutocompleteDialog";
import {NULL_FUNCTION} from "polar-shared/src/util/Functions";
import {MUITagInputControls} from "../MUITagInputControls";
import {DialogManager} from "../../../../web/spectron0/material-ui/dialogs/MUIDialogController";

export namespace TaggedCallbacks {

    import toAutocompleteOption = MUITagInputControls.toAutocompleteOption;

    interface IBase {
        readonly tags: Readonly<{[id: string]: InheritedTag}> | undefined;
    }

    import ComputeNewTagsStrategy = Tags.ComputeNewTagsStrategy;

    export interface TaggedCallbacksOpts<T> {

        /**
         * The items that should be tagged
         */
        readonly targets: () => ReadonlyArray<T>;


        readonly tagsProvider: () => ReadonlyArray<Tag>;

        readonly dialogs: DialogManager;

        readonly doTagged: (targets: ReadonlyArray<T>,
                            tags: ReadonlyArray<Tag>,
                            strategy: ComputeNewTagsStrategy) => void;

    }

    export function create<T extends IBase>(opts: TaggedCallbacksOpts<T>): () => void {

        const {doTagged, dialogs} = opts;

        const targets = opts.targets();

        if (targets.length === 0) {
            // no work to do so just terminate.
            return;
        }

        const availableTags = opts.tagsProvider();

        interface AutocompleteStrategy {
            readonly strategy: ComputeNewTagsStrategy;
            readonly existingTags: ReadonlyArray<Tag>;
            readonly description?: string | JSX.Element;
        }

        function computeAutocompleteStrategy(): AutocompleteStrategy {

            if (targets.length > 1) {

                return {
                    strategy: 'add',
                    existingTags: [],
                    description: (
                        <>
                            This will <b>ADD</b> the selected tags to <b>{targets.length}</b> items.
                        </>
                    )
                };


            }

            const annotation = targets[0];

            return {
                strategy: 'set',
                existingTags: Object.values(annotation.tags || {}),
            };

        }

        const autocompleteStrategy = computeAutocompleteStrategy();

        const autocompleteProps: AutocompleteDialogProps<Tag> = {
            title: "Assign Tags",
            description: autocompleteStrategy.description,
            options: availableTags.map(toAutocompleteOption),
            defaultOptions: autocompleteStrategy.existingTags.map(toAutocompleteOption),
            createOption: MUITagInputControls.createOption,
            onCancel: NULL_FUNCTION,
            onChange: NULL_FUNCTION,
            onDone: tags => doTagged(targets, tags, autocompleteStrategy.strategy)
        };

        return () => {
            dialogs.autocomplete(autocompleteProps);
        }

    }
}