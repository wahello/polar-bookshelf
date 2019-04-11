import {Datastore, DatastoreID, DocMetaSnapshotEvent, DocMetaSnapshotEventListener, ErrorListener, InitResult, SnapshotResult} from './Datastore';
import {DeleteResult} from './Datastore';
import {Datastores} from './Datastores';
import {DelegatedDatastore} from './DelegatedDatastore';
import {IEventDispatcher, SimpleReactor} from '../reactor/SimpleReactor';
import {Logger} from '../logger/Logger';
import {DocMetaFileRef} from './DocMetaRef';
import {DatastoreMutation} from './DatastoreMutation';
import {DefaultDatastoreMutation} from './DatastoreMutation';
import {IDocInfo} from '../metadata/DocInfo';
import {WriteOpts} from './Datastore';

const log = Logger.create();

/**
 * A remote datastore bug one that has a native implementation of snapshot
 * so that it operates in the proper thread.
 */
export class RemoteDatastore extends DelegatedDatastore {

    private readonly docMetaSnapshotEventDispatcher: IEventDispatcher<DocMetaSnapshotEvent> = new SimpleReactor();

    public readonly id: DatastoreID;

    constructor(datastore: Datastore) {
        super(datastore);
        this.id = 'remote:' + datastore.id;
    }

    public async snapshot(listener: DocMetaSnapshotEventListener): Promise<SnapshotResult> {
        return Datastores.createCommittedSnapshot(this, listener);
    }

    /**
     * Init the datastore, potentially reading files of disk, the network, etc.
     */
    public async init(errorListener?: ErrorListener): Promise<InitResult> {

        await super.init();

        if (this.docMetaSnapshotEventDispatcher.size() > 0) {

            // perform a snapshot if a listener was attached...
            this.snapshot(async event => this.docMetaSnapshotEventDispatcher.dispatchEvent(event))
                .catch(err => log.error(err));

        }

        return {};
    }

    /**
     * Delegate handle the mutations in the renderer process.
     */
    public write(fingerprint: string,
                 data: string,
                 docInfo: IDocInfo,
                 opts: WriteOpts = {}): Promise<void> {

        const datastoreMutation = opts.datastoreMutation || new DefaultDatastoreMutation();

        const result = this.delegate.write(fingerprint, data, docInfo);
        this.datastoreMutations.handle(result, datastoreMutation, () => true);

        return result;

    }

    /**
     * Delegate handle the mutations in the renderer process.
     */
    public delete(docMetaFileRef: DocMetaFileRef,
                  datastoreMutation: DatastoreMutation<boolean> = new DefaultDatastoreMutation()): Promise<Readonly<DeleteResult>> {

        const result = this.delegate.delete(docMetaFileRef);
        this.datastoreMutations.handle(result, datastoreMutation, () => true);

        return result;

    }

    /**
     * An event listener to listen to the datastore while operating on both
     * the underlying datastores to discover when documents are discovered
     * without having to re-read the datastore after it's been initialized.
     */
    public addDocMetaSnapshotEventListener(docMetaSnapshotEventListener: DocMetaSnapshotEventListener): void {
        this.docMetaSnapshotEventDispatcher.addEventListener(docMetaSnapshotEventListener);
    }

}

